import { NextRequest, NextResponse } from "next/server";
import { getMockOpportunities } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const geography = request.nextUrl.searchParams.get("geography") ?? "Boston";
  const opportunities = getMockOpportunities(geography);

  const header = [
    "company_name",
    "region",
    "country",
    "science_focus",
    "opportunity_type",
    "sourcing_likelihood",
    "trigger",
    "source_type",
    "source_title",
    "source_date",
    "source_url"
  ];

  const rows = opportunities.map((item) => [
    item.companyName,
    item.region,
    item.country,
    item.scienceFocus,
    item.opportunityType,
    item.sourcingLikelihood,
    item.trigger,
    item.sourceType,
    item.sourceTitle,
    item.sourceDate,
    item.sourceUrl
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="opportunities-${geography}.csv"`
    }
  });
}
