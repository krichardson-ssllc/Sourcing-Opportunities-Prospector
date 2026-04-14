"use client";

import { useState } from "react";
import { Opportunity } from "@/types/opportunity";
import { OpportunityCard } from "@/components/opportunity-card";

export default function HomePage() {
  const [geography, setGeography] = useState("");
  const [radius, setRadius] = useState("100");
  const [category, setCategory] = useState("all");
  const [results, setResults] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geography, radius, category })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Search failed.");
      }

      setResults(payload.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="grid grid-2">
        <section className="card card-pad">
          <h1 className="title">Surplus Solutions Sourcing Opportunity Tool</h1>
          <p className="subtitle muted">
            Enter a city, state, metro, country, or region to surface live opportunity signals from public biotech and pharma sources.
          </p>

          <div className="grid" style={{ gridTemplateColumns: "1.5fr 0.7fr 0.8fr auto" }}>
            <input
              className="input"
              value={geography}
              onChange={(e) => setGeography(e.target.value)}
              placeholder="Boston, MA · Maryland · France · EMEA"
            />
            <select className="select" value={radius} onChange={(e) => setRadius(e.target.value)}>
              <option value="25">25 miles</option>
              <option value="50">50 miles</option>
              <option value="100">100 miles</option>
              <option value="250">250 miles</option>
              <option value="region">Region-wide</option>
            </select>
            <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All categories</option>
              <option value="biotech">Biotech</option>
              <option value="pharma">Pharma</option>
              <option value="cdmo">CDMO</option>
              <option value="academic">Academic</option>
              <option value="medical">Medical</option>
            </select>
            <button className="button" onClick={handleSearch} disabled={!geography.trim() || loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          <div className="row wrap top-space small muted">
            <span className="pill">SEC EDGAR</span>
            <span className="pill">ClinicalTrials.gov</span>
            <span className="pill">openFDA</span>
            <span className="pill">WARN</span>
          </div>
        </section>

        <aside className="card card-pad">
          <h2 style={{ marginTop: 0 }}>What this version does</h2>
          <ul className="muted" style={{ lineHeight: 1.8, paddingLeft: 18 }}>
            <li>Accepts geography input from reps</li>
            <li>Calls a live server-side search route</li>
            <li>Returns structured opportunity records</li>
            <li>Combines biotech and pharma-relevant public sources</li>
            <li>Can be extended to Excel and CRM export</li>
          </ul>
        </aside>
      </div>

      <section className="top-space">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <h2 className="section-title">Results</h2>
            <p className="muted small">Results below should come from live public-source signals, not placeholder data.</p>
          </div>
        </div>

        {error ? <p style={{ color: "#991b1b" }}>{error}</p> : null}

        <div className="results top-space">
          {results.length === 0 ? (
            <div className="card card-pad muted">No results yet. Run a search to retrieve live sourcing signals.</div>
          ) : (
            results.map((item) => <OpportunityCard key={item.id} item={item} />)
          )}
        </div>
      </section>
    </main>
  );
}
