import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { OpportunityRow } from "@/types/opportunity";
import { dedupeBy, scoreWeight } from "@/lib/server/utils";
import { buildCitation, classifySignal, RawSignal } from "@/lib/server/trigger-taxonomy";
import { searchWarnSignals } from "@/lib/server/sources/warn";
import { searchClinicalTrialSignals } from "@/lib/server/sources/clinicaltrials";

const schema = z.object({
  geography: z.string().min(2),
});

function toOpportunityRow(signal: RawSignal): OpportunityRow {
  const classified = classifySignal(signal);

  return {
    id: crypto.randomUUID(),
    companyName: signal.companyName || "Unknown company",
    hqCity: signal.hqCity || "",
    hqState: signal.hqState || "",
    region: signal.region,
    country: signal.country,
    scienceFocus: signal.scienceFocus || "",
    sizeBand: signal.sizeBand || "",
    website: signal.website || "",
    likelyTrigger: classified.likelyTrigger,
    sourcingLikelihood: classified.sourcingLikelihood,
    notes: classified.notes,
    informationSourceCitations: buildCitation(signal),
    sourceType: signal.sourceType,
    sourceUrl: signal.sourceUrl,
    sourceDate: signal.sourceDate,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { geography } = schema.parse(body);

    const [warnSignals, trialSignals] = await Promise.all([
      searchWarnSignals(geography),
      searchClinicalTrialSignals(geography),
    ]);

    const allSignals = dedupeBy(
      [...warnSignals, ...trialSignals],
      (item) => `${item.companyName}|${item.sourceTitle}|${item.sourceUrl}|${item.sourceDate || ""}`
    );

    const rows = allSignals
      .map(toOpportunityRow)
      .sort((a, b) => {
        const byScore = scoreWeight(b.sourcingLikelihood) - scoreWeight(a.sourcingLikelihood);
        if (byScore !== 0) return byScore;
        return (b.sourceDate || "").localeCompare(a.sourceDate || "");
      });

    return NextResponse.json({
      geography,
      count: rows.length,
      results: rows,
      sourceCounts: {
        warn: warnSignals.length,
        clinicalTrials: trialSignals.length,
      },
      triggerCounts: rows.reduce<Record<string, number>>((acc, row) => {
        acc[row.likelyTrigger] = (acc[row.likelyTrigger] || 0) + 1;
        return acc;
      }, {}),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Search failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
