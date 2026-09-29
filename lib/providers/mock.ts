import type { MarketDataProvider } from "./provider";
import type { MarketCard } from "@/lib/market/types";

const cards: MarketCard[] = [
  {
    cardId: "mock-salah",
    name: "Mohamed Salah",
    rating: 91,
    position: "RW",
    version: "Gold Rare",
    platform: "pc",
    currentPrice: 184000,
    price1hAgo: 181500,
    price6hAgo: 190000,
    price24hAgo: 202000,
    average24h: 201000,
    low24h: 179000,
    high24h: 208000,
    observations24h: 24
  },
  {
    cardId: "mock-vicky",
    name: "Vicky López",
    rating: 88,
    position: "CAM",
    version: "Promo",
    platform: "pc",
    currentPrice: 42000,
    price1hAgo: 41000,
    price6hAgo: 43500,
    price24hAgo: 47500,
    average24h: 45800,
    low24h: 39800,
    high24h: 49250,
    observations24h: 22
  },
  {
    cardId: "mock-kika",
    name: "Kika Nazareth",
    rating: 88,
    position: "CAM",
    version: "Promo",
    platform: "pc",
    currentPrice: 61500,
    price1hAgo: 62000,
    price6hAgo: 63000,
    price24hAgo: 64000,
    average24h: 62500,
    low24h: 60000,
    high24h: 67000,
    observations24h: 19
  },
  {
    cardId: "mock-player-x",
    name: "Example Opportunity",
    rating: 86,
    position: "ST",
    version: "Special",
    platform: "pc",
    currentPrice: 17800,
    price1hAgo: 17100,
    price6hAgo: 18600,
    price24hAgo: 22100,
    average24h: 20900,
    low24h: 16800,
    high24h: 22900,
    observations24h: 24
  }
];

export class MockMarketProvider implements MarketDataProvider {
  async getMarketCards() {
    return cards;
  }
}
