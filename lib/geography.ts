export function normalizeGeography(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}
