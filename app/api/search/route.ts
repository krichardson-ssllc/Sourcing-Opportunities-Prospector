import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchSecByGeography } from "@/lib/server/sources/sec";
import { searchClinicalTrialsByGeography } from "@/lib/server/sources/clinicaltrials";
import { searchOpenFdaByGeography } from "@/lib/server/sources/openfda";
import { searchWarnByGeography } from "@/lib/server/sources/warn";
import { sortAndDedupe } from "@/lib/server/utils";

const schema = z.object({
  geography: z.string().min(2),
  radius: z.string().optional(),
  category: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { geography } = schema.parse(body);

    const [sec, trials, fda, warn] = await Promise.all([
      searchSecByGeography(geography),
      searchClinicalTrialsByGeography(geography),
      searchOpenFdaByGeography(geography),
      searchWarnByGeography(geography),
    ]);

    const results = sortAndDedupe([...sec, ...trials, ...fda, ...warn]).slice(0, 100);

    return NextResponse.json({
      geography,
      count: results.length,
      results,
      sourcesUsed: ["SEC EDGAR", "ClinicalTrials.gov", "openFDA", "WARN"],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Search failed." },
      { status: 500 }
    );
  }
}
