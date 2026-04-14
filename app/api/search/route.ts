import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { OpportunityRow } from "@/types/opportunity";
import { dedupeBy, scoreWeight, normalizeText } from "@/lib/server/utils";
import { inferEquipmentTypes } from "@/lib/server/equipment-mapping";
import { buildCitation, classifySignal, RawSignal } from "@/lib/server/trigger-taxonomy";
import { searchWarnSignals } from "@/lib/server/sources/warn";
import { searchPublicNewsSignals } from "@/lib/server/sources/public-news";

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
    likelyEquipmentTypes: inferEquipmentTypes(signal.scienceFocus || "", classified.likelyTrigger),
    notes: classified.notes,
    informationSourceCitations: buildCitation(signal),
    sourceType: signal.sourceType,
    sourceUrl: signal.sourceUrl,
    sourceDate: signal.sourceDate,
  };
}

function geographyMatchesRow(row: OpportunityRow, geography: string): boolean {
  const geo = normalizeText(geography);

  if (!geo) return true;

  const haystack = normalizeText(
    [
      row.region,
      row.hqCity,
      row.hqState,
      row.country,
      row.companyName,
      row.informationSourceCitations,
    ]
      .filter(Boolean)
      .join(" ")
  );

  const broadGeos = new Set([
    "massachusetts",
    "california",
    "maryland",
    "pennsylvania",
    "france",
    "germany",
    "belgium",
    "uk",
    "united kingdom",
    "united states",
    "us",
  ]);

  if (broadGeos.has(geo)) {
    return haystack.includes(geo);
  }

  const escaped = geo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(haystack);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { geography } = schema.parse(body);

    const [warnSignals, newsSignals] = await Promise.all([
      searchWarnSignals(geography),
      searchPublicNewsSignals(geography),
    ]);

    const allSignals = dedupeBy(
      [...warnSignals, ...newsSignals],
      (item) =>
        `${item.companyName}|${item.sourceTitle}|${item.sourceUrl}|${item.sourceDate || ""}|${item.region}`
    );

    const rows = allSignals
      .map(toOpportunityRow)
      .filter((row) => geographyMatchesRow(row, geography))
      .sort((a, b) => {
        const byScore =
          scoreWeight(b.sourcingLikelihood) - scoreWeight(a.sourcingLikelihood);
        if (byScore !== 0) return byScore;
        return (b.sourceDate || "").localeCompare(a.sourceDate || "");
      });

    return NextResponse.json({
      geography,
      count: rows.length,
      results: rows,
      sourceCounts: {
        warn: warnSignals.length,
        publicNews: newsSignals.length,
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
