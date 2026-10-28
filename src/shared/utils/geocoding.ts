import * as Location from "expo-location";
import { Platform } from "react-native";
// tz-lookup ships no bundled TS types — see src/shared/types/tz-lookup.d.ts
// for the minimal ambient declaration.
import tzlookup from "tz-lookup";

export type GeocodedBirthPlace = {
  lat: number;
  lon: number;
  /** IANA zone name, e.g. "Europe/Kyiv" — NOT a UTC offset (the offset at
   *  the birth date is resolved separately, since it can differ from the
   *  zone's current offset — see buildPreciseBirthInstant in astrology.ts). */
  timezone: string;
};

/**
 * Best-effort: resolves a free-text city name (as typed on BirthDateScreen)
 * into coordinates + an IANA timezone name, using the device's own native
 * geocoder (expo-location) — no backend, no API key, no cost. Never throws;
 * returns null on anything short of success (empty/ambiguous city text, no
 * geocoder service on the device, permission denied, offline, a city with
 * no clean geocoder match, or a resolved point tz-lookup can't place in a
 * zone, e.g. open ocean).
 *
 * KNOWN LIMITATION: birthCity stays free text (no autocomplete), so a loose
 * or ambiguous name ("Paris" without a country) can resolve to the wrong
 * place. That's an accepted tradeoff for Stage 2 — a city-search/autocomplete
 * picker would fix it but is a separate, bigger UI change than this stage.
 * A failed/wrong geocode just leaves the profile without real lat/lon/tz,
 * same as before Stage 2 existed — never a crash, never a blocked flow.
 */
export async function geocodeBirthCity(city: string): Promise<GeocodedBirthPlace | null> {
  const trimmed = city.trim();
  if (!trimmed) return null;

  try {
    const results = await attemptGeocode(trimmed);
    if (!results || results.length === 0) return null;
    const { latitude, longitude } = results[0];
    const timezone = safeTzLookup(latitude, longitude);
    if (!timezone) return null;
    return { lat: latitude, lon: longitude, timezone };
  } catch {
    return null;
  }
}

/** expo-location's geocodeAsync doesn't need location permission on iOS,
 *  but Android's underlying Geocoder has in practice needed foreground
 *  location permission granted first — so on Android, try once, and if it
 *  fails, request permission and retry once before giving up. */
async function attemptGeocode(address: string): Promise<Location.LocationGeocodedLocation[] | null> {
  try {
    return await Location.geocodeAsync(address);
  } catch (err) {
    if (Platform.OS !== "android") return null;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return null;
      return await Location.geocodeAsync(address);
    } catch {
      return null;
    }
  }
}

function safeTzLookup(lat: number, lon: number): string | null {
  try {
    const zone = tzlookup(lat, lon);
    return zone || null;
  } catch {
    return null;
  }
}

/** Public wrapper around the same tz-lookup used inside geocodeBirthCity —
 *  for callers that already have exact coordinates (e.g. a city picked from
 *  the offline autocomplete list in citySearch.ts) and just need the IANA
 *  zone name, skipping the device geocoder entirely. Never throws. */
export function timezoneForCoords(lat: number, lon: number): string | null {
  return safeTzLookup(lat, lon);
}

/** Races geocodeBirthCity against a timeout so a slow/unavailable device
 *  geocoder can never hang onboarding — used by GeneratingScreen. */
export async function geocodeBirthCityWithTimeout(
  city: string,
  timeoutMs = 3500
): Promise<GeocodedBirthPlace | null> {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    }, timeoutMs);

    geocodeBirthCity(city)
      .then((result) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(result);
        }
      })
      .catch(() => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(null);
        }
      });
  });
}
