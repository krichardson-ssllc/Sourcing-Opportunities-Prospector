export type OpportunityLikelihood = "High" | "Medium" | "Low";

export type OpportunityRow = {
  id: string;
  companyName: string;
  hqCity: string;
  hqState: string;
  region: string;
  country: string;
  scienceFocus: string;
  sizeBand: string;
  website: string;
  likelyTrigger: string;
  triggerEvidence: string;
  sourcingLikelihood: OpportunityLikelihood;
  likelyEquipmentTypes: string;
  notes: string;
  informationSourceCitations: string;
  sourceType: string;
  sourceUrl: string;
  sourceDate?: string;
};
