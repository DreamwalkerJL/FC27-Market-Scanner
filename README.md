# FC27 Market Scanner

PC market research dashboard built with Next.js and TypeScript. It supports mock examples and an optional PostgreSQL snapshot collector for a third-party FC27 PC price feed. Trades remain manual.

## Open and run

In VS Code choose **File → Open Folder** and select the cloned `FC27-Market-Scanner` folder. Then:

```bash
npm install
npm run dev
```

Open http://localhost:3000. The default source is **mock** and is clearly labeled in the UI.

## Collect PC market data

The optional feed uses the independently maintained [Parse.bot Futbin wrapper](https://parse.bot/marketplace/1b6234f9-0dfb-4cca-99b4-2d6d37aec6a7/futbin-com-api). It is not an official EA or FUTBIN API. Check the provider's access and data-use terms before using it. Obtain your own Parse.bot API key; do not commit it.

1. Start a PostgreSQL database and execute `database/schema.sql` in it, for example with `psql -d fc27 -f database/schema.sql`.
2. Copy `.env.example` to `.env.local`. Set `DATABASE_URL`, `PARSE_API_KEY`, and `MARKET_DATA_PROVIDER=postgres`. Node.js 22+ is required for the `--env-file` scripts.
3. Run `npm run discover` once. This fetches up to `DISCOVERY_PAGES` pages of FC27 cards priced at 1,000–200,000 PC coins and stores their metadata and a first snapshot. It is a **sample**, not the whole market.
4. Run `npm run collect` about once every 15–30 minutes while building history. This does not schedule itself. On Windows, a scheduled task can invoke the command from the project folder.
5. After 24 hours of sufficiently regular observations, scan in the browser. The app rejects stale prices and cards without observations near 1h, 6h and 24h lookbacks.

Each discovery page costs 3 provider credits; each batch snapshot of up to 500 card IDs costs 10 credits. For example, 48 snapshots per day cost about 480 credits/day. Review your plan and frequency before scheduling. Never expose the API key in the browser.

## How the scanner works

It filters cards to your PC coin budget, then scores deviation from the last 24h average, 1h/6h momentum, position in the 24h range, recent drawdown and **snapshot coverage**. The target is the 24h average, and projected ROI subtracts 5% transfer tax. Snapshot coverage is **not** liquidity or transaction volume. The third-party prices may be stale, and neither the target nor the BUY/WATCH/AVOID labels have been backtested. Do not treat them as guaranteed profits.

The collector only queries the third-party market-data feed. It does not sign into EA, inspect your club, or automate buying or selling.
