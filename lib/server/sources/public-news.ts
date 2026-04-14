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
  "funding biotech",
  "press release biotech restructuring",
  "pharma site closure",
];

function extractDescriptionText(value: unknown): string {
  return cleanText(String(value ?? "").replace(/<[^>]+>/g, " "));
}

function extractPublisher(title: string): string {
  const parts = title.split(" - ").map((p) => cleanText(p)).filter(Boolean);
  if (parts.length > 1) return parts[parts.length - 1];
  return "Public news / press release";
}

function guessCompanyName(title: string): string {
  const cleaned = cleanText(title.replace(/\s+-\s+[^-]+$/, ""));
  const separators = [":", "–", "-", "|"];
  for (const sep of separators) {
    const first = cleaned.split(sep)[0]?.trim();
    if (first) return first;
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

      for (const item of items.slice(0, 6)) {
        const title = cleanText(item.title);
        const link = cleanText(item.link);
        const pubDate = cleanText(item.pubDate);
        const description = extractDescriptionText(item.description);

        if (!geographyMatches(title, description, geography)) continue;

        out.push({
          companyName: guessCompanyName(title),
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
