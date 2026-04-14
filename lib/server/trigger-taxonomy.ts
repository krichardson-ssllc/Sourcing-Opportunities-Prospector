import { OpportunityLikelihood } from "@/types/opportunity";
import { cleanText } from "./utils";

export type RawSignal = {
  companyName: string;
  website?: string;
  headline?: string;
  region: string;
  country: string;
  scienceFocus?: string;
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
  triggerEvidence: string;
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
    patterns: [
      /warn/i,
      /mass layoff/i,
      /layoff/i,
      /workers affected/i,
      /workforce reduction/i,
      /job cuts/i,
    ],
    note: "Public WARN or layoff language suggests an operating footprint reduction that can create near-term sourcing opportunities.",
  },
  {
    trigger: "Plant closures & headcount reductions",
    likelihood: "High",
    patterns: [
      /facility closure/i,
      /site closure/i,
      /shutdown/i,
      /close .* facility/i,
      /headcount reduction/i,
      /plant closing/i,
      /site exit/i,
      /lab closure/i,
    ],
    note: "Public closure or shutdown language suggests direct equipment disposition potential tied to a physical site change.",
  },
  {
    trigger: "Pipeline reprioritization risk",
    likelihood: "Medium",
    patterns: [
      /pipeline/i,
      /program cut/i,
      /program discontinuation/i,
      /repriorit/i,
      /terminated program/i,
      /research shift/i,
    ],
    note: "Pipeline or program changes can reduce demand for specialized R&D equipment and increase surplus risk.",
  },
  {
    trigger: "Portfolio narrowing / spend control",
    likelihood: "Medium",
    patterns: [
      /restructuring/i,
      /cost reduction/i,
      /consolidation/i,
      /cash preservation/i,
      /expense reduction/i,
      /spend control/i,
      /downsizing/i,
    ],
    note: "Restructuring or spend-control language can point to a tighter operating footprint and selective asset liquidation.",
  },
  {
    trigger: "Funding pressure / capital discipline",
    likelihood: "Medium",
    patterns: [
      /financing/i,
      /cash runway/i,
      /going concern/i,
      /capital discipline/i,
      /funding/i,
      /liquidity/i,
      /capital constraints/i,
    ],
    note: "Funding pressure or capital-discipline language may indicate a need to shrink lab footprint, defer expansion, or dispose of non-core assets.",
  },
  {
    trigger: "Strategic uncertainty / legal overhang",
    likelihood: "Low",
    patterns: [
      /strategic alternatives/i,
      /review of options/i,
      /legal/i,
      /litigation/i,
      /overhang/i,
      /strategic review/i,
    ],
    note: "Strategic or legal uncertainty is a weaker sourcing signal alone, but can precede operational changes.",
  },
];

export function classifySignal(signal: RawSignal): ClassifiedSignal {
  const originalText = `${cleanText(signal.sourceTitle)} ${cleanText(signal.rawText)} ${cleanText(signal.rawSummary ?? "")}`;

  for (const rule of RULES) {
    const matches = rule.patterns
      .map((pattern) => {
        const hit = originalText.match(pattern);
        return hit?.[0] || "";
      })
      .filter(Boolean);

    if (matches.length > 0) {
      const uniqueMatches = Array.from(new Set(matches));

      return {
        likelyTrigger: rule.trigger,
        sourcingLikelihood: rule.likelihood,
        notes: rule.note,
        triggerEvidence: uniqueMatches.join("; "),
      };
    }
  }

  return {
    likelyTrigger: "General public-source operating signal",
    sourcingLikelihood: "Low",
    notes: "A public signal was detected, but it does not yet map cleanly to a stronger sourcing trigger.",
    triggerEvidence: "",
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
