import { Pool } from "pg";
import type { MarketDataProvider } from "./provider";
import type { MarketCard } from "@/lib/market/types";

let pool: Pool | undefined;
export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  return (pool ??= new Pool({ connectionString: process.env.DATABASE_URL }));
}

type Row = {
  provider_card_id: string;
  name: string;
  rating: number;
  position: string;
  version: string;
  price: number;
  observed_at: Date;
};

function atOrBefore(rows: Row[], time: number, maxAgeMs = 45 * 60_000) {
  return rows.find((row) => {
    const age = time - new Date(row.observed_at).getTime();
    return age >= 0 && age <= maxAgeMs;
  });
}

export class PostgresMarketProvider implements MarketDataProvider {
  async getMarketCards(): Promise<MarketCard[]> {
    const { rows } = await getPool().query<Row>(
      `select c.provider_card_id, c.name, c.rating, c.position, c.version,
              s.price, s.observed_at
       from cards c
       join price_snapshots s on s.card_id = c.id
       where c.game_year = 27 and s.platform = 'pc'
         and s.provider = 'parsebot-futbin'
         and s.observed_at >= now() - interval '27 hours'
       order by c.provider_card_id, s.observed_at desc`
    );

    const groups = new Map<string, Row[]>();
    for (const row of rows) {
      const group = groups.get(row.provider_card_id) ?? [];
      group.push(row);
      groups.set(row.provider_card_id, group);
    }

    const now = Date.now();
    const cards: MarketCard[] = [];
    for (const [cardId, history] of groups) {
      const latest = history[0];
      const latestAt = new Date(latest.observed_at).getTime();
      // Reject stale quotes and insufficient history. No invented momentum.
      if (now - latestAt > 45 * 60_000) continue;
      const h1 = atOrBefore(history, latestAt - 60 * 60_000);
      const h6 = atOrBefore(history, latestAt - 6 * 60 * 60_000);
      const h24 = atOrBefore(history, latestAt - 24 * 60 * 60_000);
      if (!h1 || !h6 || !h24) continue;
      const day = history.filter((r) => new Date(r.observed_at).getTime() >= latestAt - 24 * 60 * 60_000);
      const prices = day.map((r) => Number(r.price));
      cards.push({
        cardId, name: latest.name, rating: Number(latest.rating),
        position: latest.position, version: latest.version, platform: "pc",
        currentPrice: Number(latest.price), price1hAgo: Number(h1.price),
        price6hAgo: Number(h6.price), price24hAgo: Number(h24.price),
        average24h: prices.reduce((sum, price) => sum + price, 0) / prices.length,
        low24h: Math.min(...prices), high24h: Math.max(...prices),
        observations24h: day.length
      });
    }
    return cards;
  }
}
