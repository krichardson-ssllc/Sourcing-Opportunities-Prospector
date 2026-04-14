import { Opportunity } from "@/types/opportunity";
import { cleanText, likelihoodFromText } from "../utils";

type TickerRow = {
  cik_str: number;
  ticker: string;
  title: string;
};

async function getTickerMap(): Promise<TickerRow[]> {
  const res = await fetch("https://www.sec.gov/files/company_tickers.json", {
    headers: {
      "User-Agent": process.env.SEC_USER_AGENT || "Surplus Solutions Sourcing Tool",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = await res.json();

  return Object.values(data) as TickerRow[];
}

function geographyMatches(text: string, geography: string) {
  return text.toLowerCase().includes(geography.toLowerCase());
}

export async function searchSecByGeography(geography: string): Promise<Opportunity[]> {
  const tickers = await getTickerMap();
  const subset = tickers.slice(0, 250);
  const out: Opportunity[] = [];

  await Promise.all(
    subset.map(async (row) => {
      try {
        const cik = String(row.cik_str).padStart(10, "0");
        const res = await fetch(`https://data.sec.gov/submissions/CIK${cik}.json`, {
          headers: {
            "User-Agent": process.env.SEC_USER_AGENT || "Surplus Solutions Sourcing Tool",
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (!res.ok) return;
        const json = await res.json();

        const recent = json?.filings?.recent;
        if (!recent?.form || !recent?.filingDate || !recent?.primaryDocDescription) return;

        for (let i = 0; i < recent.form.length; i++) {
          const form = cleanText(recent.form[i]);
          const date = cleanText(recent.filingDate[i]);
          const desc = cleanText(recent.primaryDocDescription[i]);
          const accession = cleanText(recent.accessionNumber[i]).replace(/-/g, "");
          const primaryDoc = cleanText(recent.primaryDocument[i]);

          if (!["8-K", "10-Q", "10-K", "6-K", "20-F", "40-F"].includes(form)) continue;

          const combined = `${row.title} ${desc}`;
          if (!geographyMatches(combined, geography)) continue;

          out.push({
            id: crypto.randomUUID(),
            companyName: row.title,
            region: geography,
            country: "US",
            scienceFocus: "Public biotech/pharma company",
            opportunityType: "SEC filing signal",
            sourcingLikelihood: likelihoodFromText(combined),
            trigger: `${form}: ${desc}`,
            sourceType: "SEC EDGAR",
            sourceTitle: `${row.title} ${form}`,
            sourceUrl: `https://www.sec.gov/Archives/edgar/data/${row.cik_str}/${accession}/${primaryDoc}`,
            sourceDate: date,
            summary: desc,
          });
        }
      } catch {
        return;
      }
    })
  );

  return out;
}
