"use client";

import { useState } from "react";
import { OpportunityRow } from "@/types/opportunity";

type Counts = {
  warn: number;
  publicNews: number;
};

export default function HomePage() {
  const [geography, setGeography] = useState("");
  const [results, setResults] = useState<OpportunityRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceCounts, setSourceCounts] = useState<Counts | null>(null);
  const [triggerCounts, setTriggerCounts] = useState<Record<string, number> | null>(null);

  async function handleSearch() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geography }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Search failed.");
      }

      setResults(payload.results ?? []);
      setSourceCounts(payload.sourceCounts ?? null);
      setTriggerCounts(payload.triggerCounts ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
      setResults([]);
      setSourceCounts(null);
      setTriggerCounts(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 1750, margin: "0 auto", padding: 24, fontFamily: "Arial, Helvetica, sans-serif" }}>
      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24 }}>
        <h1 style={{ fontSize: 32, marginTop: 0, marginBottom: 8 }}>
          Surplus Solutions Sourcing Opportunity Tool
        </h1>
        <p style={{ color: "#6b7280", marginTop: 0 }}>
          Enter a geography and return interpreted sourcing signals based on WARN notices and public news / press release style signals tied to funding pressure, downsizing, lab closures, facility closures, and research shifts.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12 }}>
          <input
            value={geography}
            onChange={(e) => setGeography(e.target.value)}
            placeholder="Boston, Massachusetts, California, San Diego"
            style={{ padding: 12, border: "1px solid #d1d5db", borderRadius: 10, fontSize: 16 }}
          />
          <button
            onClick={handleSearch}
            disabled={!geography.trim() || loading}
            style={{
              padding: "12px 18px",
              border: 0,
              borderRadius: 10,
              background: loading ? "#9ca3af" : "#111827",
              color: "#fff",
              fontSize: 16,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        <div style={{ marginTop: 12, color: "#6b7280", fontSize: 14 }}>
          Sources currently wired: Massachusetts WARN, California WARN, public news / press release style signals
        </div>
      </section>

      {(sourceCounts || triggerCounts) && (
        <section style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Source counts</h2>
            <div style={{ color: "#374151", lineHeight: 1.8 }}>
              WARN: {sourceCounts?.warn ?? 0}<br />
              Public news: {sourceCounts?.publicNews ?? 0}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Trigger counts</h2>
            <div style={{ color: "#374151", lineHeight: 1.8 }}>
              {triggerCounts && Object.keys(triggerCounts).length > 0 ? (
                Object.entries(triggerCounts).map(([key, value]) => (
                  <div key={key}>
                    {key}: {value}
                  </div>
                ))
              ) : (
                <div>No trigger counts yet.</div>
              )}
            </div>
          </div>
        </section>
      )}

      <section style={{ marginTop: 20 }}>
        <h2 style={{ marginBottom: 6 }}>Results</h2>
        <p style={{ marginTop: 0, color: "#6b7280", fontSize: 14 }}>
          Output is structured on the original spreadsheet columns, with separate Company Name, Website, and Headline fields.
        </p>

        {error ? (
          <div style={{ color: "#991b1b", marginBottom: 12 }}>{error}</div>
        ) : null}

        <div style={{ overflowX: "auto", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1900 }}>
            <thead>
              <tr style={{ background: "#f9fafb", textAlign: "left" }}>
                {[
                  "Company Name",
                  "Website",
                  "Headline",
                  "HQ City",
                  "HQ State",
                  "Region",
                  "Country",
                  "Science Focus / Domain",
                  "Approx. Size Band (Employees)",
                  "Likely Trigger",
                  "Trigger Evidence",
                  "Sourcing Likelihood",
                  "Likely Equipment Types",
                  "Notes",
                  "Information Source Citations",
                ].map((header) => (
                  <th key={header} style={{ padding: 12, borderBottom: "1px solid #e5e7eb", fontSize: 13 }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={15} style={{ padding: 18, color: "#6b7280" }}>
                    No results returned for this geography.
                  </td>
                </tr>
              ) : (
                results.map((row) => (
                  <tr key={row.id}>
                    <td style={{ padding: 12, borderTop: "1px solid #f3f4f6" }}>{row.companyName}</td>
                    <td style={{ padding: 12, borderTop: "1px solid #f3f4f6" }}>
                      {row.website ? row.website : ""}
                    </td>
                    <td style={{ padding: 12, borderTop: "1px solid #f3f4f6", maxWidth: 360 }}>{row.headline}</td>
                    <td style={{ padding: 12, borderTop: "1px solid #f3f4f6" }}>{row.hqCity}</td>
                    <td style={{ padding: 12, borderTop: "1px solid #f3f4f6" }}>{row.hqState}</td>
                    <td style={{ padding: 12, borderTop: "1px solid #f3f4f6" }}>{row.region}</td>
                    <td style={{ padding: 12, borderTop: "1px solid #f3f4f6" }}>{row.country}</td>
                    <td style={{ padding: 12, borderTop: "1px solid #f3f4f6" }}>{row.scienceFocus}</td>
                    <td style={{ padding: 12, borderTop: "1px solid #f3f4f6" }}>{row.sizeBand}</td>
                    <td style={{ padding: 12, borderTop: "1px solid #f3f4f6" }}>{row.likelyTrigger}</td>
                    <td style={{ padding: 12, borderTop: "1px solid #f3f4f6", maxWidth: 220 }}>{row.triggerEvidence}</td>
                    <td style={{ padding: 12, borderTop: "1px solid #f3f4f6" }}>{row.sourcingLikelihood}</td>
                    <td style={{ padding: 12, borderTop: "1px solid #f3f4f6", maxWidth: 360 }}>{row.likelyEquipmentTypes}</td>
                    <td style={{ padding: 12, borderTop: "1px solid #f3f4f6", maxWidth: 360 }}>{row.notes}</td>
                    <td style={{ padding: 12, borderTop: "1px solid #f3f4f6", maxWidth: 420 }}>
                      {row.sourceUrl ? (
                        <a href={row.sourceUrl} target="_blank" rel="noreferrer">
                          {row.informationSourceCitations}
                        </a>
                      ) : (
                        row.informationSourceCitations
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
