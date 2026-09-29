"use client";

import { FormEvent, useState } from "react";
import type { ScanResult } from "@/lib/market/types";

export default function Home() {
  const [budget, setBudget] = useState(200000);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("Run a scan to see the source");
  const [message, setMessage] = useState("");

  async function scan(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/scan?budget=${budget}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Scan failed");
      setResults(body.results);
      setSource(body.source);
      setMessage(body.results.length ? "" : body.source.startsWith("Stored")
        ? "No cards have complete, recent 24-hour PC history yet. Keep collecting snapshots and try again."
        : "No cards fit this budget.");
    } catch (error) {
      setResults([]);
      setMessage(error instanceof Error ? error.message : "Scan failed");
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
            momentum, snapshot coverage and tax-adjusted upside.
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
        Source: {source}. Prices from a third party may lag the market. Signals
        are estimates, not verified trading profits.
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
              <div><span>Heuristic confidence</span><strong>{item.confidence}%</strong></div>
            </div>

            <div className="score">
              <span>Opportunity score</span>
              <strong>{item.opportunityScore}/100</strong>
            </div>

            <p className="reason">{item.reason}</p>
          </article>
        ))}
      </section>

      {(message || !results.length) && (
        <div className="empty">
          {message || "Enter your budget and run the first market scan."}
        </div>
      )}
    </main>
  );
}
