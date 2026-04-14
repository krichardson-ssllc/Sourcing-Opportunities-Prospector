import { NextRequest, NextResponse } from "next/server";
import { normalizeGeography } from "@/lib/geography";
import { getMockOpportunities } from "@/lib/mock-data";
import { SearchRequest, SearchResponse } from "@/types/opportunity";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as SearchRequest;
  const normalizedGeography = normalizeGeography(body.geography || "");

  if (!normalizedGeography) {
    return NextResponse.json({ error: "Geography is required." }, { status: 400 });
  }

  const opportunities = getMockOpportunities(normalizedGeography);

  const response: SearchResponse = {
    normalizedGeography,
    resultCount: opportunities.length,
    opportunities
  };

  return NextResponse.json(response);
}
