import type { MarketCard, ScanResult } from "./types";

type ScanOptions = {
  budget: number;
  platform: "pc";
  maxPositionSizePct: number;
};

const EA_TAX = 0.05;

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function pct(current: number, previous: number) {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

export function scanMarket(
  cards: MarketCard[],
  options: ScanOptions
): ScanResult[] {
  const maxBuyPrice = options.budget * options.maxPositionSizePct;

  return cards
    .filter((card) => card.platform === options.platform)
    .filter((card) => card.currentPrice <= maxBuyPrice)
    .map((card) => {
      const discountVsAvg = -pct(card.currentPrice, card.average24h);
      const momentum1h = pct(card.currentPrice, card.price1hAgo);
      const momentum6h = pct(card.currentPrice, card.price6hAgo);
      const drawdown24h = -pct(card.currentPrice, card.price24hAgo);

      const range = Math.max(1, card.high24h - card.low24h);
      const rangePosition =
        ((card.currentPrice - card.low24h) / range) * 100;

      const valueScore = clamp(50 + discountVsAvg * 7);
      const momentumScore = clamp(
        50 + momentum1h * 8 + momentum6h * 2
      );
      const liquidityScore = clamp(card.observations24h * 4);
      const rangeScore = clamp(100 - rangePosition);
      const reboundScore = clamp(45 + drawdown24h * 4);

      const opportunityScore = Math.round(
        valueScore * 0.30 +
        momentumScore * 0.25 +
        liquidityScore * 0.15 +
        rangeScore * 0.20 +
        reboundScore * 0.10
      );

      const targetPrice = Math.max(
        card.currentPrice,
        Math.round(card.average24h / 250) * 250
      );

      const netSale = targetPrice * (1 - EA_TAX);
      const netRoiPct = ((netSale - card.currentPrice) / card.currentPrice) * 100;

      const confidence = Math.round(
        clamp(
          35 +
          Math.min(card.observations24h, 24) * 1.5 +
          Math.max(0, discountVsAvg) * 2
        )
      );

      const signal =
        opportunityScore >= 67 && netRoiPct >= 4
          ? "BUY"
          : opportunityScore >= 52 && netRoiPct >= 1
          ? "WATCH"
          : "AVOID";

      const reasonParts = [
        `${Math.abs(discountVsAvg).toFixed(1)}% ${
          discountVsAvg >= 0 ? "below" : "above"
        } its 24h average`,
        `${momentum1h >= 0 ? "+" : ""}${momentum1h.toFixed(1)}% over 1h`,
        `at ${rangePosition.toFixed(0)}% of its 24h range`
      ];

      return {
        cardId: card.cardId,
        name: card.name,
        rating: card.rating,
        position: card.position,
        version: card.version,
        currentPrice: card.currentPrice,
        targetPrice,
        netRoiPct,
        opportunityScore,
        confidence,
        signal,
        reason: reasonParts.join(" · ")
      };
    })
    .sort((a, b) => b.opportunityScore - a.opportunityScore);
}
