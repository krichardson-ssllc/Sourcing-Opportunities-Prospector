export type SourcingLikelihood = "High" | "Medium" | "Low";

export interface Opportunity {
  id: string;
  companyName: string;
  region: string;
  country: string;
  scienceFocus: string;
  opportunityType: string;
  sourcingLikelihood: SourcingLikelihood;
  trigger: string;
  sourceType: string;
  sourceUrl: string;
  sourceTitle: string;
  summary: string;
  sourceDate: string;
}

export interface SearchRequest {
  geography: string;
  radius: string;
  category: string;
}

export interface SearchResponse {
  normalizedGeography: string;
  resultCount: number;
  opportunities: Opportunity[];
}
