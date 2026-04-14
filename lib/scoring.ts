import { OpportunityLikelihood } from "@/types/opportunity";

export function scoreLikelihood(confidence: number): OpportunityLikelihood {
  if (confidence >= 80) return "High";
  if (confidence >= 50) return "Medium";
  return "Low";
}
