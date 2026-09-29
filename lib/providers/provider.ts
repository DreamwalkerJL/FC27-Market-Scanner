import type { MarketCard } from "@/lib/market/types";

export interface MarketDataProvider {
  getMarketCards(): Promise<MarketCard[]>;
}
