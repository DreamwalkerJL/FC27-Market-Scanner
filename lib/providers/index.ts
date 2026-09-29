import type { MarketDataProvider } from "./provider";
import { MockMarketProvider } from "./mock";
import { PostgresMarketProvider } from "./postgres";

export function getMarketProvider(): MarketDataProvider {
  return process.env.MARKET_DATA_PROVIDER === "postgres"
    ? new PostgresMarketProvider()
    : new MockMarketProvider();
}
