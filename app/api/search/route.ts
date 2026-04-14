import { cleanText, inferCountry, normalizeText } from "../utils";
import { RawSignal } from "../trigger-taxonomy";

function locationMatchesGeography(
  geography: string,
  city?: string,
  state?: string,
  country?: string,
  facility?: string
): boolean {
  const g = normalizeText(geography);
  const haystack = normalizeText(
    [city, state, country, facility].filter(Boolean).join(" ")
  );

  return g ? haystack.includes(g) : false;
}

export async function searchClinicalTrialSignals(
  geography: string
): Promise<RawSignal[]> {
  const statuses = ["TERMINATED", "WITHDRAWN", "SUSPENDED"];
  const out: RawSignal[] = [];

  for (const status of statuses) {
    const url =
      `https://clinicaltrials.gov/api/v2/studies` +
      `?query.term=${encodeURIComponent(geography)}` +
      `&filter.overallStatus=${encodeURIComponent(status)}` +
      `&pageSize=50` +
      `&format=json`;

    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;

      const json = await res.json();
      const studies = Array.isArray(json?.studies) ? json.studies : [];

      for (const study of studies) {
        const protocol = study.protocolSection || {};
        const identificationModule = protocol.identificationModule || {};
        const statusModule = protocol.statusModule || {};
        const sponsorModule = protocol.sponsorCollaboratorsModule || {};
        const conditionsModule = protocol.conditionsModule || {};
        const contactsLocationsModule = protocol.contactsLocationsModule || {};

        const companyName = cleanText(
          sponsorModule.leadSponsor?.name || "Unknown sponsor"
        );
        const title = cleanText(
          identificationModule.briefTitle || identificationModule.officialTitle
        );
        const nctId = cleanText(identificationModule.nctId);
        const whyStopped = cleanText(statusModule.whyStopped);
        const overallStatus = cleanText(statusModule.overallStatus);
        const conditions = Array.isArray(conditionsModule.conditions)
          ? conditionsModule.conditions.join(", ")
          : "";

        const locations = Array.isArray(contactsLocationsModule.locations)
          ? contactsLocationsModule.locations
          : [];

        const matchingLocations = locations.filter((loc: any) =>
          locationMatchesGeography(
            geography,
            cleanText(loc.city),
            cleanText(loc.state),
            cleanText(loc.country),
            cleanText(loc.facility)
          )
        );

        if (matchingLocations.length === 0) continue;

        for (const loc of matchingLocations) {
          const city = cleanText(loc.city);
          const state = cleanText(loc.state);
          const country = cleanText(loc.country) || inferCountry(geography);
          const facility = cleanText(loc.facility);
          const region = [city, state || country].filter(Boolean).join(", ");

          out.push({
            companyName,
            region,
            country,
            scienceFocus: conditions || "Clinical development",
            website: "",
            sizeBand: "",
            sourceType: "ClinicalTrials.gov",
            sourceUrl: nctId
              ? `https://clinicaltrials.gov/study/${nctId}`
              : "https://clinicaltrials.gov/",
            sourceTitle: title || nctId || "Clinical trial status change",
            sourceDate: cleanText(statusModule.lastUpdatePostDateStruct?.date),
            rawText: `${overallStatus}${whyStopped ? ` | ${whyStopped}` : ""}`,
            rawSummary: whyStopped || `Study status: ${overallStatus}`,
            hqCity: city,
            hqState: state,
          });
        }
      }
    } catch {
      // ignore source failure
    }
  }

  return out;
}
