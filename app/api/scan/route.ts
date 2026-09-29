import { NextRequest, NextResponse } from "next/server";
import { getMarketProvider } from "@/lib/providers";
import { scanMarket } from "@/lib/market/analyze";

export async function GET(request: NextRequest) {
  const budget = Number(request.nextUrl.searchParams.get("budget") ?? 200000);

  if (!Number.isFinite(budget) || budget <= 0) {
    return NextResponse.json({ error: "Invalid budget" }, { status: 400 });
  }

  try {
    const provider = getMarketProvider();
    const cards = await provider.getMarketCards();

    const results = scanMarket(cards, {
      budget,
      platform: "pc",
      maxPositionSizePct: 1
    });

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      budget,
      platform: "pc",
      source: process.env.MARKET_DATA_PROVIDER === "postgres" ? "Stored PC price snapshots (Parse.bot / FUTBIN)" : "Mock example prices",
      cardsAnalyzed: cards.length,
      results
    });
  } catch (error) {
    console.error("Market scan failed", error);
    return NextResponse.json({ error: "Market data unavailable. Check the database connection and server logs." }, { status: 503 });
  }
}
