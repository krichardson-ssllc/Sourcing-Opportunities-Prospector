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

function geographyMatches(title: string, description: string, geography: string): boolean {
  const needle = normalizeText(geography);
  const haystack = normalizeText(`${title} ${description}`);
  return needle ? haystack.includes(needle) : true;
}

function extractCompanyName(title: string, description: string): string {
  const combined = `${title} ${description}`;

  const companyPatterns = [
    /^([A-Z][A-Za-z0-9&.\-,' ]{1,80}?)\s+(announces|reports|closes|shuts|cuts|lays off|restructures|explores|faces|files)\b/,
    /^([A-Z][A-Za-z0-9&.\-,' ]{1,80}?)\s*:\s*/,
    /^([A-Z][A-Za-z0-9&.\-,' ]{1,80}?)\s*[-–|]\s*/,
  ];

  for (const pattern of companyPatterns) {
    const match = combined.match(pattern);
    if (match?.[1]) {
      return cleanText(match[1]);
    }
  }

  return "";
}

function extractWebsite(link: string): string {
  try {
    const url = new URL(link);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
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

        const companyName = extractCompanyName(title, description);
        if (!companyName) continue;

        out.push({
          companyName,
          website: extractWebsite(link),
          headline: title,
          region: geography,
          country: inferCountry(geography),
          scienceFocus: "Biotech / pharma operations",
          sourceType: extractPublisher(title),
          sourceUrl: link,
          sourceTitle: title,
          sourceDate: pubDate,
          rawText: `${title} | ${description}`,
          rawSummary: description,
          hqCity: "",
          hqState: "",
          sizeBand: "",
        });
      }
    } catch {
      // ignore source failure
    }
  }

  return out;
}
