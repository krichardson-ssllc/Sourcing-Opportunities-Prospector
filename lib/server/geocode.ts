import { cleanText } from "./utils";

type GeocodeResult = {
  lat: number;
  lon: number;
};

export async function geocodePlace(query: string): Promise<GeocodeResult | null> {
  const q = cleanText(query);
  if (!q) return null;

  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Surplus Solutions Sourcing Opportunity Tool"
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const json = await res.json();
  if (!Array.isArray(json) || json.length === 0) return null;

  const first = json[0];
  const lat = Number(first.lat);
  const lon = Number(first.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  return { lat, lon };
}

export function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 3958.8;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
