"use client";

import { FormEvent, useState } from "react";
import type { ScanResult } from "@/lib/market/types";

export default function Home() {
  const [budget, setBudget] = useState(200000);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function scan(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/scan?budget=${budget}`);
      if (!response.ok) throw new Error("Scan failed");

      const body = await response.json();
      setResults(body.results);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <span className="eyebrow">PC MARKET · FC27</span>
          <h1>Market Scanner</h1>
          <p>
            Find cards that fit your coin balance and rank them by value,
            momentum, liquidity and tax-adjusted upside.
          </p>
        </div>

        <form className="budgetBox" onSubmit={scan}>
          <label htmlFor="budget">Available coins</label>
          <div className="budgetRow">
            <input
              id="budget"
              type="number"
              min={1000}
              step={1000}
              value={budget}
              onChange={(event) => setBudget(Number(event.target.value))}
            />
            <button disabled={loading}>
              {loading ? "Scanning…" : "Scan market"}
            </button>
          </div>
        </form>
      </header>

      <section className="notice">
        MVP currently runs on mock price observations. The provider layer is
        intentionally replaceable so live FC27 data can be connected without
        rewriting the scanner.
      </section>

      <section className="grid">
        {results.map((item) => (
          <article className="card" key={item.cardId}>
            <div className="cardTop">
              <div>
                <span className="version">{item.version}</span>
                <h2>{item.name}</h2>
                <span className="meta">
                  {item.rating} · {item.position}
                </span>
              </div>
              <div className={`signal ${item.signal.toLowerCase()}`}>
                {item.signal}
              </div>
            </div>

            <div className="numbers">
              <div><span>Price</span><strong>{item.currentPrice.toLocaleString()}</strong></div>
              <div><span>Target</span><strong>{item.targetPrice.toLocaleString()}</strong></div>
              <div><span>Net ROI</span><strong>{item.netRoiPct.toFixed(1)}%</strong></div>
              <div><span>Confidence</span><strong>{item.confidence}%</strong></div>
            </div>

            <div className="score">
              <span>Opportunity score</span>
              <strong>{item.opportunityScore}/100</strong>
            </div>

            <p className="reason">{item.reason}</p>
          </article>
        ))}
      </section>

      {!results.length && (
        <div className="empty">
          Enter your budget and run the first market scan.
        </div>
      )}
    </main>
  );
}
