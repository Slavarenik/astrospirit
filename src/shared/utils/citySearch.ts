import cities from "@shared/data/cities.json";
import { COUNTRY_NAMES } from "@shared/data/countryNames";

/** [name, ISO country code, latitude, longitude, population] — kept as a
 *  plain tuple array (not objects) in the bundled JSON purely to keep the
 *  shipped asset small (~1.4MB for ~34k cities with population ≥15,000,
 *  from GeoNames' cities15000 export, CC BY 4.0). */
type CityRow = [string, string, number, number, number];

const CITIES = cities as CityRow[];

export type CityMatch = {
  name: string;
  countryCode: string;
  countryName: string;
  lat: number;
  lon: number;
  population: number;
};

/** Lowercased, diacritic-stripped name, computed once per city on first use
 *  (not on every keystroke) — "kyiv" should match "Kyiv", "sao paulo"
 *  should match "São Paulo". */
let normalizedNames: string[] | null = null;
function getNormalizedNames(): string[] {
  if (!normalizedNames) {
    normalizedNames = CITIES.map((row) => normalize(row[0]));
  }
  return normalizedNames;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Local, offline city search over the bundled GeoNames-derived dataset —
 * no network, no API key (see geocoding.ts for the free-text fallback this
 * replaces when the person picks a suggestion instead of typing blind).
 * Ranks exact-prefix matches above substring matches, population
 * descending within each tier, so typing "lon" surfaces London before some
 * much smaller "Something London".
 */
export function searchCities(query: string, limit = 8): CityMatch[] {
  const q = normalize(query.trim());
  if (!q) return [];

  const names = getNormalizedNames();
  const prefixMatches: number[] = [];
  const substringMatches: number[] = [];

  for (let i = 0; i < CITIES.length; i++) {
    const name = names[i];
    if (name.startsWith(q)) prefixMatches.push(i);
    else if (name.includes(q)) substringMatches.push(i);
  }

  const byPopulationDesc = (a: number, b: number) => CITIES[b][4] - CITIES[a][4];
  prefixMatches.sort(byPopulationDesc);
  substringMatches.sort(byPopulationDesc);

  const ordered = [...prefixMatches, ...substringMatches].slice(0, limit);
  return ordered.map((i) => {
    const [name, countryCode, lat, lon, population] = CITIES[i];
    return {
      name,
      countryCode,
      countryName: COUNTRY_NAMES[countryCode] ?? countryCode,
      lat,
      lon,
      population,
    };
  });
}
