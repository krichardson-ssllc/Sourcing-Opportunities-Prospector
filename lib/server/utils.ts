import { Opportunity, SourcingLikelihood } from "@/types/opportunity";

export function cleanText(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function inferCountry(geography: string): string {
  const g = geography.toLowerCase();
  if (g.includes("france")) return "France";
  if (g.includes("germany")) return "Germany";
  if (g.includes("belgium")) return "Belgium";
  if (g.includes("uk") || g.includes("united kingdom")) return "UK";
  return "US";
}

export function likelihoodFromText(text: string): SourcingLikelihood {
  const t = text.toLowerCase();

  if (
    t.includes("layoff") ||
    t.includes("mass layoff") ||
    t.includes("plant closing") ||
    t.includes("facility closure") ||
    t.includes("shutdown") ||
    t.includes("bankruptcy") ||
    t.includes("liquidation") ||
    t.includes("terminated")
  ) {
    return "High";
  }

  if (
    t.includes("restructuring") ||
    t.includes("cost reduction") ||
    t.includes("consolidation") ||
    t.includes("withdrawn") ||
    t.includes("suspended") ||
    t.includes("recall") ||
    t.includes("discontinued")
  ) {
    return "Medium";
  }

  return "Low";
}

export function sortAndDedupe(results: Opportunity[]): Opportunity[] {
  const seen = new Set<string>();
  const weight = { High: 3, Medium: 2, Low: 1 };

  const filtered = results.filter((r) => {
    const key = `${r.companyName}|${r.sourceTitle}|${r.sourceUrl}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return filtered.sort(
    (a, b) => weight[b.sourcingLikelihood] - weight[a.sourcingLikelihood]
  );
}
