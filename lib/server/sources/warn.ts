import * as XLSX from "xlsx";
import { cleanText, inferCountry, normalizeText } from "../utils";
import { RawSignal } from "../trigger-taxonomy";

type WarnRow = Record<string, unknown>;

function matchesGeography(text: string, geography: string): boolean {
  const haystack = normalizeText(text);
  const needle = normalizeText(geography);

  if (!needle) return true;

  const broadRegions = [
    "massachusetts",
    "california",
    "maryland",
    "pennsylvania",
    "france",
    "germany",
    "belgium",
    "uk",
    "united kingdom",
    "us",
    "united states",
  ];

  if (broadRegions.includes(needle)) {
    return haystack.includes(needle);
  }

  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
}

function parseWorkers(value: unknown): string {
  return String(value ?? "").trim();
}

async function fetchCsvRows(url: string): Promise<WarnRow[]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const text = await res.text();
  const wb = XLSX.read(text, { type: "string" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<WarnRow>(sheet, { defval: "" });
}

async function fetchWorkbookRows(url: string): Promise<WarnRow[]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const arrayBuffer = await res.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<WarnRow>(sheet, { defval: "" });
}

function mapMassachusetts(rows: WarnRow[], geography: string, url: string): RawSignal[] {
  const out: RawSignal[] = [];

  for (const row of rows) {
    const companyName = cleanText(row["Company Name"] ?? row["Company"] ?? row["Employer"]);
    const city = cleanText(row["City"] ?? row["City/Town"] ?? row["Location"]);
    const notes = cleanText(row["Notes"] ?? row["Closure/Layoff"]);
    const workers = parseWorkers(row["Employees"] ?? row["Workers"] ?? row["Number of Employees"]);
    const date = cleanText(row["Effective Date"] ?? row["Notice Date"] ?? row["Date"]);
    const region = [city, "Massachusetts"].filter(Boolean).join(", ");
    const geoText = [companyName, city, "Massachusetts", notes].join(" ");

    if (!matchesGeography(geoText, geography)) continue;

    out.push({
      companyName,
      region,
      country: inferCountry(geography),
      sourceType: "Massachusetts WARN",
      sourceUrl: url,
      sourceTitle: `${companyName || "Unknown company"} WARN notice`,
      sourceDate: date,
      rawText: [notes, workers ? `${workers} workers affected` : ""].filter(Boolean).join(" | "),
      rawSummary: notes || "Massachusetts WARN notice match",
      hqCity: city,
      hqState: "MA",
      scienceFocus: "Biotech / pharma operations",
      website: "",
      sizeBand: "",
    });
  }

  return out;
}

function mapCalifornia(rows: WarnRow[], geography: string, url: string): RawSignal[] {
  const out: RawSignal[] = [];

  for (const row of rows) {
    const companyName = cleanText(row["Company Name"] ?? row["Employer"] ?? row["company"]);
    const city = cleanText(row["City"] ?? row["city"]);
    const county = cleanText(row["County"] ?? row["county"]);
    const noticeType = cleanText(row["Notice Type"] ?? row["WARN Notice Type"]);
    const workers = parseWorkers(row["No. Of Employees"] ?? row["Employees"] ?? row["employees"]);
    const date = cleanText(row["Received Date"] ?? row["Effective Date"] ?? row["Date"]);
    const region = [city || county, "California"].filter(Boolean).join(", ");
    const geoText = [companyName, city, county, "California", noticeType].join(" ");

    if (!matchesGeography(geoText, geography)) continue;

    out.push({
      companyName,
      region,
      country: inferCountry(geography),
      sourceType: "California WARN",
      sourceUrl: url,
      sourceTitle: `${companyName || "Unknown company"} WARN notice`,
      sourceDate: date,
      rawText: [noticeType, workers ? `${workers} workers affected` : ""].filter(Boolean).join(" | "),
      rawSummary: noticeType || "California WARN notice match",
      hqCity: city,
      hqState: "CA",
      scienceFocus: "Biotech / pharma operations",
      website: "",
      sizeBand: "",
    });
  }

  return out;
}

export async function searchWarnSignals(geography: string): Promise<RawSignal[]> {
  const out: RawSignal[] = [];
  const maUrl = process.env.WARN_MA_FEED?.trim();
  const caUrl = process.env.WARN_CA_FEED?.trim();

  if (maUrl) {
    try {
      const rows = await fetchCsvRows(maUrl);
      out.push(...mapMassachusetts(rows, geography, maUrl));
    } catch {
      // ignore feed failure
    }
  }

  if (caUrl) {
    try {
      const rows = await fetchWorkbookRows(caUrl);
      out.push(...mapCalifornia(rows, geography, caUrl));
    } catch {
      // ignore feed failure
    }
  }

  return out;
}
