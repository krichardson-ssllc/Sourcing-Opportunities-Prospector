export function cleanText(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function normalizeText(value: unknown): string {
  return cleanText(value).toLowerCase();
}

export function inferCountry(geography: string): string {
  const g = normalizeText(geography);
  if (g.includes("france")) return "France";
  if (g.includes("germany")) return "Germany";
  if (g.includes("belgium")) return "Belgium";
  if (g.includes("uk") || g.includes("united kingdom")) return "UK";
  return "US";
}

export function dedupeBy<T>(items: T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function scoreWeight(value: "High" | "Medium" | "Low"): number {
  if (value === "High") return 3;
  if (value === "Medium") return 2;
  return 1;
}
