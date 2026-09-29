import { getPool } from "../lib/providers/postgres";

const BASE = "https://api.parse.bot/scraper/21963078-8a17-40ff-a896-9b0b0ec3e828";
const key = process.env.PARSE_API_KEY;
if (!key || !process.env.DATABASE_URL) {
  console.error("Set PARSE_API_KEY and DATABASE_URL in .env.local (or your shell).");
  process.exit(1);
}

type Json = Record<string, unknown>;
function object(value: unknown): Json {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Unexpected provider response");
  return value as Json;
}
async function request(endpoint: string, params: Record<string, string>) {
  const url = new URL(`${BASE}/${endpoint}`);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
  const response = await fetch(url, {
    headers: { "X-API-Key": key! },
    signal: AbortSignal.timeout(60_000)
  });
  if (!response.ok) throw new Error(`Provider ${endpoint}: HTTP ${response.status}`);
  const envelope = object(await response.json());
  if (envelope.status && envelope.status !== "success") throw new Error(`Provider ${endpoint} returned ${String(envelope.status)}`);
  const data = envelope.data ?? envelope;
  return Array.isArray(data) ? { players: data } : object(data);
}

function findPlayerRows(input: Json, endpoint: string): { payload: Json; rows: unknown[] } {
  const queue: Json[] = [input];
  const seen = new Set<Json>();
  while (queue.length) {
    const payload = queue.shift()!;
    if (seen.has(payload)) continue;
    seen.add(payload);
    for (const key of ["players", "results", "items", "cards", "rows"]) {
      if (Array.isArray(payload[key])) return { payload, rows: payload[key] as unknown[] };
    }
    for (const key of ["data", "result", "output", "response", "payload"]) {
      const nested = payload[key];
      if (nested && typeof nested === "object" && !Array.isArray(nested)) queue.push(nested as Json);
    }
  }
  throw new Error(`${endpoint}: player list missing. Response fields: ${Object.keys(input).join(", ") || "(none)"}`);
}

function positiveInt(value: unknown): number | null {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

async function discover() {
  const pages = Math.min(10, Math.max(1, Number(process.env.DISCOVERY_PAGES) || 3));
  let count = 0;
  for (let page = 1; page <= pages; page++) {
    const result = await request("list_fc27_players", {
      page: String(page), platform: "pc", min_price: "1000",
      max_price: "200000", sort_by_price: "desc"
    });
    const { payload, rows: players } = findPlayerRows(result, "list_fc27_players");
    for (const raw of players) {
      const p = object(raw);
      const id = positiveInt(p.id);
      const rating = positiveInt(p.rating);
      const pcPrice = positiveInt(p.price_pc_coins);
      if (!id || !rating || !pcPrice || pcPrice < 1000 || pcPrice > 200000 || typeof p.name !== "string") continue;
      await getPool().query(
        `insert into cards (provider_card_id, game_year, name, rating, position, version)
         values ($1, 27, $2, $3, $4, $5)
         on conflict (provider_card_id, game_year) do update
         set name = excluded.name, rating = excluded.rating, position = excluded.position,
             version = excluded.version, updated_at = now()`,
        [String(id), p.name, rating, String(p.position ?? ""), String(p.version ?? "")]
      );
      count++;
    }
    if (!(payload.has_more ?? result.has_more)) break;
  }
  console.log(`Discovered ${count} FC27 cards (PC price filter, up to ${pages} pages).`);
}

async function snapshot() {
  const { rows } = await getPool().query<{ id: string; provider_card_id: string }>(
    "select id, provider_card_id from cards where game_year = 27 and provider_card_id ~ '^[0-9]+$' order by id"
  );
  if (!rows.length) throw new Error("No cards found; run npm run discover first.");
  let saved = 0;
  for (let offset = 0; offset < rows.length; offset += 500) {
    const batch = rows.slice(offset, offset + 500);
    const result = await request("get_fc27_market_snapshot", {
      player_ids: batch.map((row) => row.provider_card_id).join(","),
      year: "27", platform: "pc"
    });
    const { payload, rows: players } = findPlayerRows(result, "get_fc27_market_snapshot");
    const meta = { ...result, ...payload };
    if (String(meta.platform).toLowerCase() !== "pc" || String(meta.year) !== "27") {
      throw new Error("Snapshot platform/year mismatch; no prices saved");
    }
    const timestamp = Number(meta.timestamp);
    if (!Number.isFinite(timestamp) || Math.abs(Date.now() - timestamp) > 10 * 60_000) {
      throw new Error("Snapshot timestamp missing or stale");
    }
    const ids = new Map(batch.map((row) => [row.provider_card_id, row.id]));
    for (const raw of players) {
      const p = object(raw);
      const cardId = ids.get(String(p.player_id));
      const price = positiveInt(p.price);
      if (!cardId || !price) continue;
      await getPool().query(
        `insert into price_snapshots (card_id, platform, price, observed_at, provider)
         values ($1, 'pc', $2, $3, 'parsebot-futbin')
         on conflict (card_id, platform, observed_at, provider) do nothing`,
        [cardId, price, new Date(timestamp)]
      );
      saved++;
    }
  }
  console.log(`Stored ${saved} PC prices at ${new Date().toISOString()}.`);
}

async function main() {
  try {
    if (process.argv.includes("--discover")) await discover();
    await snapshot();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await getPool().end();
  }
}

void main();
