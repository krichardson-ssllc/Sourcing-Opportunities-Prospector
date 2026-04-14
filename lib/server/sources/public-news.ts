import { XMLParser } from "fast-xml-parser";
import { cleanText, inferCountry, normalizeText } from "../utils";
import { RawSignal } from "../trigger-taxonomy";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
});

const SIGNAL_QUERIES = [
  "biotech layoff",
  "pharma layoff",
  "facility closure biotech",
  "lab closure biotech",
  "restructuring biotech",
  "pipeline reprioritization biotech",
  "cash runway biotech",
  "funding loss biotech",
  "strategic review biotech",
  "site shutdown pharma",
  "cost reduction biotech",
  "bankruptcy biotech",
  "liquidation biotech"
];

const POSITIVE_PATTERNS = [
  /layoff/i,
  /facility closure/i,
  /site closure/i,
  /shutdown/i,
  /restructuring/i,
  /cost reduction/i,
  /pipeline repriorit/i,
  /program cut/i,
  /program discontinuation/i,
  /cash runway/i,
  /funding loss/i,
  /liquidity/i,
  /bankruptcy/i,
  /liquidation/i,
  /strategic review/i,
  /strategic alternatives/i,
  /consolidation/i,
  /headcount reduction/i,
  /wind-down/i,
  /site exit/i,
  /manufacturing transfer/i
];

const NEGATIVE_PATTERNS = [
  /companies climbing/i,
  /companies to watch/i,
  /top biotech/i,
  /best biotech/i,
  /biotech scene/i,
  /industry roundup/i,
  /startups to watch/i,
  /fastest growing/i,
  /growing companies/i,
  /rising biotech/i,
  /innovation spotlight/i,
  /conference/i,
  /event/i,
  /award/i,
  /funding roundup/i,
  /market overview/i
];

function extractDescriptionText(value: unknown): string {
  return cleanText(String(value ?? "").replace(/<[^>]+>/g, " "));
}

function extractPublisher(title: string): string {
  const parts = title.split(" - ").map((p) => cleanText(p)).filter(Boolean);
  if (parts.length > 1) return parts[parts.length - 1];
  return "Public news / press release";
}

function looksActionable(title: string, description: string): boolean {
  const combined = `${title} ${description}`;

  if (NEGATIVE_PATTERNS.some((pattern) => pattern.test(combined))) {
    return false;
  }

  return POSITIVE_PATTERNS.some((pattern) => pattern.test(combined));
}

function guessCompanyName(title: string): string {
  const cleaned = cleanText(title.replace(/\s+-\s+[^-]+$/, ""));

  const badStarts = [
    "seven biotech companies",
    "top biotech companies",
    "biotech companies",
    "pharma companies",
    "industry roundup",
    "companies to watch",
    "startups to watch"
  ];

  const lower = cleaned.toLowerCase();
  if (badStarts.some((s) => lower.startsWith(s))) {
    return "";
  }

  const separators = [":", "–", "|"];
  for (const sep of separators) {
    const first = cleaned.split(sep)[0]?.trim();
    if (first && first.split(" ").length <= 8) return first;
  }

  const hyphenParts = cleaned.split(" - ").map((p) => p.trim()).filter(Boolean);
  if (hyphenParts.length > 0 && hyphenParts[0].split(" ").length <= 8) {
    return hyphenParts[0];
  }

  return cleaned;
}

function geographyMatches(title: string, description: string, geography: string): boolean {
  const needle = normalizeText(geography);
  const haystack = normalizeText(`${title} ${description}`);
  return needle ? haystack.includes(needle) : true;
}

export async function searchPublicNewsSignals(geography: string): Promise<RawSignal[]> {
  const out: RawSignal[] = [];

  for (const query of SIGNAL_QUERIES) {
    const rssUrl =
      `https://news.google.com/rss/search?q=${encodeURIComponent(`${geography} ${query}`)}` +
      `&hl=en-US&gl=US&ceid=US:en`;

    try {
      const res = await fetch(rssUrl, { cache: "no-store" });
      if (!res.ok) continue;

      const xml = await res.text();
      const parsed = parser.parse(xml);
      const items = parsed?.rss?.channel?.item
        ? Array.isArray(parsed.rss.channel.item)
          ? parsed.rss.channel.item
          : [parsed.rss.channel.item]
        : [];

      for (const item of items.slice(0, 8)) {
        const title = cleanText(item.title);
        const link = cleanText(item.link);
        const pubDate = cleanText(item.pubDate);
        const description = extractDescriptionText(item.description);

        if (!geographyMatches(title, description, geography)) continue;
        if (!looksActionable(title, description)) continue;

        const companyName = guessCompanyName(title);
        if (!companyName) continue;

        out.push({
          companyName,
          region: geography,
          country: inferCountry(geography),
          scienceFocus: "Biotech / pharma operations",
          website: "",
          sizeBand: "",
          sourceType: extractPublisher(title),
          sourceUrl: link,
          sourceTitle: title,
          sourceDate: pubDate,
          rawText: `${title} | ${description}`,
          rawSummary: description,
          hqCity: "",
          hqState: "",
        });
      }
    } catch {
      // ignore source failure
    }
  }

  return out;
}
