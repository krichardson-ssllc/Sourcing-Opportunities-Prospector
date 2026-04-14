import { SourcingLikelihood } from "@/types/opportunity";

export function scoreLikelihood(confidence: number): SourcingLikelihood {
  if (confidence >= 80) return "High";
  if (confidence >= 50) return "Medium";
  return "Low";
}

export function calculateConfidence(opts: {
  recencyScore: number;
  credibilityScore: number;
  severityScore: number;
  geographyScore: number;
  corroborationScore: number;
}): number {
  const total =
    opts.recencyScore * 0.2 +
    opts.credibilityScore * 0.25 +
    opts.severityScore * 0.2 +
    opts.geographyScore * 0.2 +
    opts.corroborationScore * 0.15;

  return Math.max(0, Math.min(100, Math.round(total)));
}
