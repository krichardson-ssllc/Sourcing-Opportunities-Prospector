import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { OpportunityRow } from "@/types/opportunity";
import { dedupeBy, scoreWeight, normalizeText } from "@/lib/server/utils";
import { inferEquipmentTypes } from "@/lib/server/equipment-mapping";
import { buildCitation, classifySignal, RawSignal } from "@/lib/server/trigger-taxonomy";
import { searchWarnSignals } from "@/lib/server/sources/warn";
import { searchPublicNewsSignals } from "@/lib/server/sources/public-news";
import { geocodePlace, haversineMiles } from "@/lib/server/geocode";

const schema = z.object({
  geography: z.string().min(2),
  radiusMiles: z.number().optional(),
});

function toOpportunityRow(signal: RawSignal): OpportunityRow {
  const classified = classifySignal(signal);

  return {
    id: crypto.randomUUID(),
    companyName: signal.companyName || "",
    website: signal.website || "",
    headline: signal.headline || signal.sourceTitle || "",
    hqCity: signal.hqCity || "",
    hqState: signal.hqState || "",
    region: signal.region,
    country: signal.country,
    scienceFocus: signal.scienceFocus || "",
    sizeBand: signal.sizeBand || "",
    likelyTrigger: classified.likelyTrigger,
    triggerEvidence: classified.triggerEvidence,
    sourcingLikelihood: classified.sourcingLikelihood,
    likelyEquipmentTypes: inferEquipmentTypes(
      signal.scienceFocus || "",
      classified.likelyTrigger
    ),
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
      row.headline,
      row.informationSourceCitations,
    ]
      .filter(Boolean)
      .join(" ")
  );

  const escaped = geo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(haystack);
}

function isBadHeadlineAsCompany(row: OpportunityRow): boolean {
  if (!row.companyName) return false;
  return normalizeText(row.companyName) === normalizeText(row.headline);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { geography, radiusMiles } = schema.parse(body);

    const [warnSignals, newsSignals] = await Promise.all([
      searchWarnSignals(geography),
      searchPublicNewsSignals(geography),
    ]);

    const allSignals = dedupeBy(
      [...warnSignals, ...newsSignals],
      (item) =>
        `${item.companyName}|${item.sourceTitle}|${item.sourceUrl}|${item.sourceDate || ""}|${item.region}`
    );

    let rows = allSignals
      .map(toOpportunityRow)
      .filter((row) => geographyMatchesRow(row, geography))
      .map((row) =>
        isBadHeadlineAsCompany(row)
          ? { ...row, companyName: "" }
          : row
      );

    if (radiusMiles && radiusMiles > 0) {
      const center = await geocodePlace(geography);

      if (center) {
        const rowsWithDistance: OpportunityRow[] = [];

        for (const row of rows) {
          const loc =
            [row.hqCity, row.hqState, row.country].filter(Boolean).join(", ") ||
            [row.region, row.country].filter(Boolean).join(", ");

          const point = await geocodePlace(loc);
          if (!point) continue;

          const miles = haversineMiles(center.lat, center.lon, point.lat, point.lon);

          if (miles <= radiusMiles) {
            rowsWithDistance.push({
              ...row,
              latitude: point.lat,
              longitude: point.lon,
              distanceMiles: Math.round(miles * 10) / 10,
            });
          }
        }

        rows = rowsWithDistance;
      }
    }

    rows = rows.sort((a, b) => {
      const byScore =
        scoreWeight(b.sourcingLikelihood) - scoreWeight(a.sourcingLikelihood);
      if (byScore !== 0) return byScore;

      if (typeof a.distanceMiles === "number" && typeof b.distanceMiles === "number") {
        return a.distanceMiles - b.distanceMiles;
      }

      return (b.sourceDate || "").localeCompare(a.sourceDate || "");
    });

    return NextResponse.json({
      geography,
      radiusMiles: radiusMiles || null,
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
