import { normalizeText } from "./utils";

function addAll(set: Set<string>, items: string[]) {
  items.forEach((item) => set.add(item));
}

export function inferEquipmentTypes(
  scienceFocus: string,
  trigger: string,
  headline: string = "",
  notes: string = "",
  sourceText: string = ""
): string {
  const text = normalizeText(
    [scienceFocus, trigger, headline, notes, sourceText].filter(Boolean).join(" ")
  );

  const types = new Set<string>();

  // Flow / cell analysis
  if (
    /flow cytometry|cell sorter|cell analysis|facs|cytometer|immunotherapy|cell therapy|car-t|tcr|gene therapy|cgmp cell/i.test(
      text
    )
  ) {
    addAll(types, [
      "flow cytometers",
      "cell sorters",
      "biosafety cabinets",
      "CO2 incubators",
      "centrifuges",
      "freezers",
    ]);
  }

  // Genomics / molecular biology
  if (
    /genomics|sequencing|pcr|qpcr|ddpcr|molecular biology|ngs|dna|rna|gene editing/i.test(
      text
    )
  ) {
    addAll(types, [
      "PCR / qPCR systems",
      "sequencers",
      "automated extraction systems",
      "liquid handlers",
      "plate readers",
      "freezers",
    ]);
  }

  // Analytical / QC / chemistry
  if (
    /analytical|qc|quality control|mass spectrometry|mass spec|lc\/ms|hplc|uplc|uhplc|chromatography|spectrometry/i.test(
      text
    )
  ) {
    addAll(types, [
      "HPLC / UHPLC systems",
      "LC/MS systems",
      "chromatography systems",
      "balances",
      "spectrometers",
      "sample prep systems",
    ]);
  }

  // Bioprocess / manufacturing / fill-finish
  if (
    /bioprocess|biologics|vaccine|fermentation|upstream|downstream|fill-finish|fill finish|manufacturing|cdmo|process development/i.test(
      text
    )
  ) {
    addAll(types, [
      "single-use bioreactors",
      "chromatography systems",
      "TFF skids",
      "process vessels",
      "freezers",
      "lyophilizers",
    ]);
  }

  // Imaging / cell biology / discovery
  if (
    /cell biology|discovery|microscopy|microscope|imaging|live-cell|live cell|high-content|assay/i.test(
      text
    )
  ) {
    addAll(types, [
      "microscopes",
      "live-cell imagers",
      "plate readers",
      "liquid handlers",
      "incubators",
    ]);
  }

  // Microbiology / microbiome
  if (/microbiology|microbiome|culture|sterility/i.test(text)) {
    addAll(types, [
      "incubators",
      "plate readers",
      "centrifuges",
      "PCR systems",
      "freezers",
    ]);
  }

  // Automation
  if (/automation|liquid handling|liquid handler|robotic|screening/i.test(text)) {
    addAll(types, [
      "liquid handlers",
      "automation platforms",
      "plate readers",
      "sample prep systems",
    ]);
  }

  // Trigger-based additions
  if (/facility closure|site wind-down|headcount reductions|shutdown|site exit/i.test(text)) {
    addAll(types, [
      "general lab support equipment",
      "freezers",
      "incubators",
      "centrifuges",
    ]);
  }

  if (/pipeline reprioritization|program discontinuation|research shift/i.test(text)) {
    addAll(types, [
      "specialized R&D instruments",
      "assay systems",
      "analytical platforms",
    ]);
  }

  if (/portfolio narrowing|spend control|capital discipline|funding pressure/i.test(text)) {
    addAll(types, [
      "discovery lab equipment",
      "analytical instruments",
      "automation platforms",
    ]);
  }

  if (types.size === 0) {
    addAll(types, [
      "general lab equipment",
      "analytical instruments",
      "support equipment",
    ]);
  }

  return Array.from(types).join("; ");
}
