import { Opportunity } from "@/types/opportunity";
import { likelihoodFromText, cleanText } from "../utils";

type WarnRow = {
  company?: string;
  company_name?: string;
  employer?: string;
  city?: string;
  state?: string;
  location?: string;
  effective_date?: string;
  notice_date?: string;
  layoff_date?: string;
  workers?: string | number;
  employees?: string | number;
  notes?: string;
};

function csvToRows(csv: string): WarnRow[] {
  const [headerLine, ...lines] = csv.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(",").map((h) => h.trim());
  return lines.map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}

export async function searchWarnByGeography(geography: string): Promise<Opportunity[]> {
  const feedUrls = [
    process.env.WARN_MA_FEED,
    process.env.WARN_CA_FEED,
    process.env.WARN_MD_FEED,
    process.env.WARN_PA_FEED,
  ].filter(Boolean) as string[];

  const out: Opportunity[] = [];

  await Promise.all(
    feedUrls.map(async (url) => {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;

      const contentType = res.headers.get("content-type") || "";
      let rows: WarnRow[] = [];

      if (contentType.includes("application/json")) {
        rows = await res.json();
      } else {
        rows = csvToRows(await res.text());
      }

      for (const row of rows) {
        const regionText = cleanText(
          `${row.city || ""} ${row.state || ""} ${row.location || ""}`
        );
        if (!regionText.toLowerCase().includes(geography.toLowerCase())) continue;

        const company =
          cleanText(row.company || row.company_name || row.employer) || "Unknown company";
        const workers = cleanText(row.workers || row.employees);
        const notes = cleanText(row.notes);
        const date = cleanText(row.effective_date || row.notice_date || row.layoff_date);

        out.push({
          id: crypto.randomUUID(),
          companyName: company,
          region: regionText,
          country: "US",
          scienceFocus: "Operations / site footprint",
          opportunityType: "WARN layoff / closure signal",
          sourcingLikelihood: likelihoodFromText(`layoff ${workers} ${notes}`),
          trigger: workers ? `${workers} workers affected` : "WARN notice",
          sourceType: "State WARN feed",
          sourceTitle: `${company} WARN notice`,
          sourceUrl: url,
          sourceDate: date,
          summary: notes || "State WARN notice match",
        });
      }
    })
  );

  return out;
}
