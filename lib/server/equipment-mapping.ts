import { normalizeText } from "./utils";

export function inferEquipmentTypes(scienceFocus: string, trigger: string): string {
  const sf = normalizeText(scienceFocus);
  const tr = normalizeText(trigger);
  const types = new Set<string>();

  if (sf.includes("cell therapy") || sf.includes("immunotherapy") || sf.includes("gene therapy")) {
    [
      "flow cytometers",
      "cell sorters",
      "biosafety cabinets",
      "CO2 incubators",
      "centrifuges",
      "bioreactors",
      "freezers",
      "microscopes / imaging",
      "liquid handlers",
    ].forEach((x) => types.add(x));
  }

  if (sf.includes("analytical") || sf.includes("qc") || sf.includes("pharma analysis") || sf.includes("mass spec")) {
    [
      "HPLC / UHPLC systems",
      "LC/MS systems",
      "balances",
      "spectrometers",
      "plate readers",
      "sample prep systems",
    ].forEach((x) => types.add(x));
  }

  if (sf.includes("bioprocess") || sf.includes("vaccine") || sf.includes("biologics") || sf.includes("cdmo")) {
    [
      "single-use bioreactors",
      "chromatography systems",
      "TFF skids",
      "lyophilizers",
      "process vessels",
      "freezers",
    ].forEach((x) => types.add(x));
  }

  if (sf.includes("genomics") || sf.includes("molecular")) {
    [
      "PCR / qPCR systems",
      "sequencers",
      "liquid handlers",
      "automated extraction systems",
      "plate readers",
    ].forEach((x) => types.add(x));
  }

  if (sf.includes("cell biology") || sf.includes("discovery")) {
    [
      "live-cell imagers",
      "microscopes",
      "flow cytometers",
      "incubators",
      "liquid handlers",
      "plate readers",
    ].forEach((x) => types.add(x));
  }

  if (sf.includes("microbiome")) {
    [
      "plate readers",
      "incubators",
      "freezers",
      "centrifuges",
      "PCR systems",
    ].forEach((x) => types.add(x));
  }

  if (sf.includes("manufacturing") || sf.includes("fill-finish")) {
    [
      "filling lines",
      "isolators",
      "lyophilizers",
      "inspection systems",
      "packaging equipment",
    ].forEach((x) => types.add(x));
  }

  if (tr.includes("facility closure") || tr.includes("site wind-down") || tr.includes("headcount reductions")) {
    [
      "general lab support equipment",
      "freezers",
      "incubators",
      "centrifuges",
      "analytical instruments",
    ].forEach((x) => types.add(x));
  }

  if (tr.includes("research shift") || tr.includes("program discontinuation") || tr.includes("pipeline")) {
    [
      "specialized R&D instruments",
      "assay systems",
      "liquid handlers",
      "analytical platforms",
    ].forEach((x) => types.add(x));
  }

  if (tr.includes("portfolio narrowing") || tr.includes("spend control") || tr.includes("capital")) {
    [
      "select analytical systems",
      "discovery lab equipment",
      "automation platforms",
    ].forEach((x) => types.add(x));
  }

  if (types.size === 0) {
    [
      "general lab equipment",
      "analytical instruments",
      "support equipment",
    ].forEach((x) => types.add(x));
  }

  return Array.from(types).join("; ");
}
