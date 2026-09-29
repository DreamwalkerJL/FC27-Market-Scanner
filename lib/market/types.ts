export type MarketSignal = "BUY" | "WATCH" | "AVOID";

export interface MarketCard {
  cardId: string;
  name: string;
  rating: number;
  position: string;
  version: string;
  platform: "pc";
  currentPrice: number;
  price1hAgo: number;
  price6hAgo: number;
  price24hAgo: number;
  average24h: number;
  low24h: number;
  high24h: number;
  observations24h: number;
}

export interface ScanResult {
  cardId: string;
  name: string;
  rating: number;
  position: string;
  version: string;
  currentPrice: number;
  targetPrice: number;
  netRoiPct: number;
  opportunityScore: number;
  confidence: number;
  signal: MarketSignal;
  reason: string;
}
