import { OpportunityLikelihood } from "@/types/opportunity";
import { cleanText, normalizeText } from "./utils";

export type RawSignal = {
  companyName: string;
  region: string;
  country: string;
  scienceFocus?: string;
  website?: string;
  sourceType: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceDate?: string;
  rawText: string;
  rawSummary?: string;
  hqCity?: string;
  hqState?: string;
  sizeBand?: string;
};

type ClassifiedSignal = {
  likelyTrigger: string;
  sourcingLikelihood: OpportunityLikelihood;
  notes: string;
};

const RULES: Array<{
  trigger: string;
  likelihood: OpportunityLikelihood;
  patterns: RegExp[];
  note: string;
}> = [
  {
    trigger: "Site wind-down & WARN notices",
    likelihood: "High",
    patterns: [/warn/i, /mass layoff/i, /layoff/i, /workers affected/i],
    note: "Public WARN or layoff signal suggests a facility-level change that may create near-term equipment disposition opportunities.",
  },
  {
    trigger: "Facility closure / site shutdown",
    likelihood: "High",
    patterns: [/facility closure/i, /site closure/i, /shutdown/i, /plant closing/i, /close .* facility/i],
    note: "Public closure or shutdown language suggests direct surplus-equipment potential tied to site contraction or exit.",
  },
  {
    trigger: "Research shift / program discontinuation",
    likelihood: "Medium",
    patterns: [/terminated/i, /suspended/i, /withdrawn/i, /why stopped/i, /program discontinuation/i, /repriorit/i],
    note: "Program disruption or trial status change may indicate a research shift, reduced lab demand, or redeployment of non-core assets.",
  },
  {
    trigger: "Portfolio narrowing / spend control",
    likelihood: "Medium",
    patterns: [/cost reduction/i, /restructuring/i, /consolidation/i, /cash preservation/i, /operational efficiency/i],
    note: "Restructuring or spend-control language can point to a tighter operating footprint and selective asset liquidation opportunities.",
  },
  {
    trigger: "Regulatory / recall pressure",
    likelihood: "Low",
    patterns: [/recall/i, /enforcement/i, /warning letter/i],
    note: "Regulatory pressure is a weaker sourcing signal on its own, but may contribute to future operational change.",
  },
];

export function classifySignal(signal: RawSignal): ClassifiedSignal {
  const haystack = normalizeText(`${signal.sourceTitle} ${signal.rawText} ${signal.rawSummary ?? ""}`);

  for (const rule of RULES) {
    if (rule.patterns.some((pattern) => pattern.test(haystack))) {
      return {
        likelyTrigger: rule.trigger,
        sourcingLikelihood: rule.likelihood,
        notes: rule.note,
      };
    }
  }

  return {
    likelyTrigger: "General public-source operating signal",
    sourcingLikelihood: "Low",
    notes: "Public-source signal was detected, but it does not yet map cleanly to a stronger sourcing trigger.",
  };
}

export function buildCitation(signal: RawSignal): string {
  const parts = [
    cleanText(signal.sourceType),
    cleanText(signal.sourceTitle),
    cleanText(signal.sourceDate),
    cleanText(signal.sourceUrl),
  ].filter(Boolean);

  return parts.join(" | ");
}
