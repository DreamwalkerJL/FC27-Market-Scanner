import type { MarketDataProvider } from "./provider";
import { MockMarketProvider } from "./mock";

export function getMarketProvider(): MarketDataProvider {
  return new MockMarketProvider();
}
