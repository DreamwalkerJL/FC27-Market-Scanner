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

On Windows, with Docker Desktop running and Node.js 22+ installed, run:

```powershell
npm run setup:windows
npm install
```

The setup starts a local PostgreSQL container, creates the tables, and creates `.env.local` if it is missing. It never overwrites an existing `.env.local`. Put your own key after `PARSE_API_KEY=` in that file. If you already have PostgreSQL, you can instead run `database/schema.sql` yourself and set your own `DATABASE_URL`.

Then:

```powershell
npm run discover
npm run dev
```

`discover` fetches up to `DISCOVERY_PAGES` pages of FC27 cards priced at 1,000–200,000 PC coins and stores their metadata and a first snapshot. It is a **sample**, not the whole market. Run `npm run collect` regularly to build history. It does not schedule itself or spend API credits in the background. After 24 hours of sufficiently regular observations, scan in the browser; stale or incomplete card histories are excluded.

Each discovery page costs 3 provider credits; each batch snapshot of up to 500 card IDs costs 10 credits. Even hourly polling costs about 240 credits/day, above the provider's 200-credit monthly free tier. Review your plan before collecting regularly. Never expose the API key in the browser.

## How the scanner works

It filters cards to your PC coin budget, then scores deviation from the last 24h average, 1h/6h momentum, position in the 24h range, recent drawdown and **snapshot coverage**. The target is the 24h average, and projected ROI subtracts 5% transfer tax. Snapshot coverage is **not** liquidity or transaction volume. The third-party prices may be stale, and neither the target nor the BUY/WATCH/AVOID labels have been backtested. Do not treat them as guaranteed profits.

The collector only queries the third-party market-data feed. It does not sign into EA, inspect your club, or automate buying or selling.
