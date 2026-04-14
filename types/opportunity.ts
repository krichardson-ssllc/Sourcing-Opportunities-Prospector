export type OpportunityLikelihood = "High" | "Medium" | "Low";

export type OpportunityRow = {
  id: string;
  companyName: string;
  website: string;
  headline: string;
  hqCity: string;
  hqState: string;
  region: string;
  country: string;
  scienceFocus: string;
  sizeBand: string;
  likelyTrigger: string;
  triggerEvidence: string;
  sourcingLikelihood: OpportunityLikelihood;
  likelyEquipmentTypes: string;
  notes: string;
  informationSourceCitations: string;
  sourceType: string;
  sourceUrl: string;
  sourceDate?: string;
  latitude?: number;
  longitude?: number;
  distanceMiles?: number;
};
