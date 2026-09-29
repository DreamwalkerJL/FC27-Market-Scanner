# FC27 Market Scanner

A Next.js + TypeScript MVP for a PC-focused EA SPORTS FC 27 market intelligence app.

The first build intentionally uses mock observations. The market data source sits behind a provider interface so a live feed can be swapped in later without rewriting the scanner.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 and run a scan.

## Current features

- coin-budget filtering
- PC-specific market model
- 5% EA tax in projected ROI
- 1h and 6h momentum
- deviation from 24h average
- recent-range positioning
- opportunity score
- BUY / WATCH / AVOID signals
- confidence score
- replaceable MarketDataProvider
- PostgreSQL-ready schema for cards, snapshots, portfolio and market events

## Signal model v0.1

The score is deliberately explainable:

- 30% value vs 24h average
- 25% short-term momentum
- 15% observation/data-quality proxy
- 20% position inside 24h range
- 10% rebound potential after a 24h drop

This is a starting hypothesis, not a claim that the strategy is profitable.

## Next milestone

1. Connect one permitted/live market-data provider.
2. Poll PC card prices on a schedule.
3. Store immutable snapshots in PostgreSQL.
4. Calculate metrics from our own history.
5. Add backtesting before tuning BUY thresholds.
6. Add watchlists, portfolio and alerts.
7. Later: SBC/promo/content event features and ML.

## Scope

This project is designed as a market analysis and recommendation tool. It should not automate EA account transactions, sniping, buying or selling.
