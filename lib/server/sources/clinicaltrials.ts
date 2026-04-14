import { Opportunity } from "@/types/opportunity";
import { inferCountry, likelihoodFromText, cleanText } from "../utils";

export async function searchClinicalTrialsByGeography(
  geography: string
): Promise<Opportunity[]> {
  const statuses = ["TERMINATED", "WITHDRAWN", "SUSPENDED"];
  const out: Opportunity[] = [];

  await Promise.all(
    statuses.map(async (status) => {
      const url =
        `https://clinicaltrials.gov/api/v2/studies` +
        `?query.term=${encodeURIComponent(geography)}` +
        `&filter.overallStatus=${encodeURIComponent(status)}` +
        `&pageSize=25` +
        `&format=json`;

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;

      const json = await res.json();
      const studies = Array.isArray(json?.studies) ? json.studies : [];

      for (const study of studies) {
        const protocol = study.protocolSection || {};
        const idMod = protocol.identificationModule || {};
        const statusMod = protocol.statusModule || {};
        const sponsorMod = protocol.sponsorCollaboratorsModule || {};
        const condMod = protocol.conditionsModule || {};

        const title = cleanText(idMod.briefTitle || idMod.officialTitle);
        const nctId = cleanText(idMod.nctId);
        const sponsor = cleanText(
          sponsorMod.leadSponsor?.name || "Unknown sponsor"
        );
        const overallStatus = cleanText(statusMod.overallStatus);
        const whyStopped = cleanText(statusMod.whyStopped);
        const conditions = Array.isArray(condMod.conditions)
          ? condMod.conditions.join(", ")
          : "";

        out.push({
          id: crypto.randomUUID(),
          companyName: sponsor,
          region: geography,
          country: inferCountry(geography),
          scienceFocus: conditions || "Clinical development",
          opportunityType: "Clinical program disruption",
          sourcingLikelihood: likelihoodFromText(`${overallStatus} ${whyStopped}`),
          trigger: `${overallStatus}${whyStopped ? ` - ${whyStopped}` : ""}`,
          sourceType: "ClinicalTrials.gov",
          sourceTitle: title || nctId,
          sourceUrl: nctId ? `https://clinicaltrials.gov/study/${nctId}` : "https://clinicaltrials.gov/",
          sourceDate: cleanText(statusMod.lastUpdatePostDateStruct?.date),
          summary: whyStopped || `Study status: ${overallStatus}`,
        });
      }
    })
  );

  return out;
}
