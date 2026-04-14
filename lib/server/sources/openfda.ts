import { Opportunity } from "@/types/opportunity";
import { inferCountry, likelihoodFromText, cleanText } from "../utils";

function withApiKey(url: string) {
  const key = process.env.OPENFDA_API_KEY?.trim();
  if (!key) return url;
  return `${url}${url.includes("?") ? "&" : "?"}api_key=${encodeURIComponent(key)}`;
}

export async function searchOpenFdaByGeography(
  geography: string
): Promise<Opportunity[]> {
  const base =
    "https://api.fda.gov/drug/enforcement.json" +
    `?search=${encodeURIComponent(`city:"${geography}" OR state:"${geography}" OR distribution_pattern:"${geography}"`)}` +
    "&limit=20";

  const res = await fetch(withApiKey(base), { cache: "no-store" });
  if (!res.ok) return [];

  const json = await res.json();
  const results = Array.isArray(json?.results) ? json.results : [];

  return results.map((r: any) => {
    const product = cleanText(r.product_description);
    const recallingFirm = cleanText(r.recalling_firm);
    const reason = cleanText(r.reason_for_recall);
    const classification = cleanText(r.classification);
    const reportDate = cleanText(r.report_date);

    return {
      id: crypto.randomUUID(),
      companyName: recallingFirm || "Unknown company",
      region: geography,
      country: inferCountry(geography),
      scienceFocus: "Drug manufacturing / regulated operations",
      opportunityType: "FDA enforcement / recall signal",
      sourcingLikelihood: likelihoodFromText(`${classification} ${reason}`),
      trigger: `${classification} recall`,
      sourceType: "openFDA",
      sourceTitle: product || "Drug enforcement report",
      sourceUrl: "https://open.fda.gov/apis/drug/enforcement/",
      sourceDate: reportDate,
      summary: reason,
    } as Opportunity;
  });
}
