import { Opportunity } from "@/types/opportunity";

const demoData: Opportunity[] = [
  {
    id: "1",
    companyName: "Example Biotech Opportunity",
    region: "Greater Boston, MA",
    country: "US",
    scienceFocus: "Cell therapy / analytical development",
    opportunityType: "Facility consolidation signal",
    sourcingLikelihood: "High",
    trigger: "Public notice, job contraction, and site status change",
    sourceType: "Public filings + company news + job signals",
    sourceUrl: "https://example.com/source-1",
    sourceTitle: "Example source 1",
    summary: "Illustrative record only. Replace with live public-source results tied to the selected geography.",
    sourceDate: "2026-04-10"
  },
  {
    id: "2",
    companyName: "Example Research Site",
    region: "Cambridge, UK",
    country: "UK",
    scienceFocus: "Genomics / drug discovery",
    opportunityType: "Lab footprint reduction",
    sourcingLikelihood: "Medium",
    trigger: "Program reprioritization and local downsizing indicators",
    sourceType: "Regional news + hiring trends + company updates",
    sourceUrl: "https://example.com/source-2",
    sourceTitle: "Example source 2",
    summary: "Illustrative record only. This shows the output structure the real pipeline should return.",
    sourceDate: "2026-04-09"
  },
  {
    id: "3",
    companyName: "Example Pharma Operation",
    region: "Lyon, France",
    country: "France",
    scienceFocus: "Bioprocessing / fill-finish",
    opportunityType: "Equipment redeployment potential",
    sourcingLikelihood: "Medium",
    trigger: "Operational transition and site modernization",
    sourceType: "Trade press + local filings + facility announcements",
    sourceUrl: "https://example.com/source-3",
    sourceTitle: "Example source 3",
    summary: "Illustrative record only. A production build would query fresh sources for the entered geography.",
    sourceDate: "2026-04-08"
  }
];

export function getMockOpportunities(geography: string): Opportunity[] {
  if (!geography.trim()) return [];
  return demoData.map((item, index) => ({
    ...item,
    id: `${item.id}-${index}-${geography.toLowerCase().replace(/\s+/g, "-")}`
  }));
}
