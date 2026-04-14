import { cleanText, inferCountry } from "../utils";
import { RawSignal } from "../trigger-taxonomy";

export async function searchClinicalTrialSignals(geography: string): Promise<RawSignal[]> {
  const statuses = ["TERMINATED", "WITHDRAWN", "SUSPENDED"];
  const out: RawSignal[] = [];

  for (const status of statuses) {
    const url =
      `https://clinicaltrials.gov/api/v2/studies` +
      `?query.term=${encodeURIComponent(geography)}` +
      `&filter.overallStatus=${encodeURIComponent(status)}` +
      `&pageSize=20` +
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

        const companyName = cleanText(sponsorModule.leadSponsor?.name || "Unknown sponsor");
        const title = cleanText(identificationModule.briefTitle || identificationModule.officialTitle);
        const nctId = cleanText(identificationModule.nctId);
        const whyStopped = cleanText(statusModule.whyStopped);
        const overallStatus = cleanText(statusModule.overallStatus);
        const city = cleanText(contactsLocationsModule?.locations?.[0]?.city);
        const state = cleanText(contactsLocationsModule?.locations?.[0]?.state);
        const conditions = Array.isArray(conditionsModule.conditions)
          ? conditionsModule.conditions.join(", ")
          : "";

        out.push({
          companyName,
          region: geography,
          country: inferCountry(geography),
          scienceFocus: conditions || "Clinical development",
          website: "",
          sizeBand: "",
          sourceType: "ClinicalTrials.gov",
          sourceUrl: nctId ? `https://clinicaltrials.gov/study/${nctId}` : "https://clinicaltrials.gov/",
          sourceTitle: title || nctId || "Clinical trial status change",
          sourceDate: cleanText(statusModule.lastUpdatePostDateStruct?.date),
          rawText: `${overallStatus}${whyStopped ? ` | ${whyStopped}` : ""}`,
          rawSummary: whyStopped || `Study status: ${overallStatus}`,
          hqCity: city,
          hqState: state,
        });
      }
    } catch {
      // ignore feed failure
    }
  }

  return out;
}
