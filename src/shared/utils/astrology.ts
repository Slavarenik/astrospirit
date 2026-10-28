import * as Astronomy from "astronomy-engine";
import { ZodiacSign, ZODIAC_ELEMENT, ZODIAC_SIGNS, PlanetKey, PLANET_KEYS } from "@shared/theme";

/** Returns the tropical zodiac sign for a given birth date (month is 1-12). */
export function getZodiacSign(month: number, day: number): ZodiacSign {
  // Each entry is the FIRST day that sign begins; scan backwards from Dec to find the match.
  const order: { sign: ZodiacSign; startMonth: number; startDay: number }[] = [
    { sign: "Aries", startMonth: 3, startDay: 21 },
    { sign: "Taurus", startMonth: 4, startDay: 20 },
    { sign: "Gemini", startMonth: 5, startDay: 21 },
    { sign: "Cancer", startMonth: 6, startDay: 21 },
    { sign: "Leo", startMonth: 7, startDay: 23 },
    { sign: "Virgo", startMonth: 8, startDay: 23 },
    { sign: "Libra", startMonth: 9, startDay: 23 },
    { sign: "Scorpio", startMonth: 10, startDay: 23 },
    { sign: "Sagittarius", startMonth: 11, startDay: 22 },
    { sign: "Capricorn", startMonth: 12, startDay: 22 },
    { sign: "Aquarius", startMonth: 1, startDay: 20 },
    { sign: "Pisces", startMonth: 2, startDay: 19 },
  ];
  let result: ZodiacSign = "Aries";
  for (const o of order) {
    const afterStart =
      month > o.startMonth || (month === o.startMonth && day >= o.startDay);
    if (afterStart) result = o.sign;
  }
  return result;
}

/**
 * Rough ascendant estimate from birth hour only — still illustrative, NOT
 * ephemeris-accurate, and this is a structural limit rather than a math
 * one: a real Ascendant needs Local Sidereal Time (birth instant + exact
 * longitude) and birth latitude run through spherical trigonometry against
 * the ecliptic. Onboarding only captures birthCity as free text today (see
 * BirthDateScreen.tsx) — no geocoded lat/long, no timezone. Natal-chart
 * Stage 2 is adding that (geocoding birthCity → lat/long/timezone), which
 * is the real prerequisite for replacing this function, not a better
 * formula. Leave this as the honest "estimate" until then.
 */
export function estimateAscendant(sunSign: ZodiacSign, birthHour: number): ZodiacSign {
  const sunIdx = ZODIAC_SIGNS.indexOf(sunSign);
  const shift = Math.floor(((birthHour + 6) % 24) / 2);
  return ZODIAC_SIGNS[(sunIdx + shift) % 12];
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}
function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Mean obliquity of the ecliptic, degrees (Meeus low-precision polynomial —
 *  accurate to well under an arcminute over many centuries either side of
 *  J2000, far more precision than an Ascendant calculation needs). */
function meanObliquityDeg(centuriesSinceJ2000: number): number {
  const T = centuriesSinceJ2000;
  return (
    23.439291111111 -
    0.0130041666667 * T -
    0.00000016388889 * T * T +
    0.000000503611 * T * T * T
  );
}

function julianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/** Greenwich Mean Sidereal Time, degrees (Meeus 12.4 — the standard
 *  low-precision formula; its constant term, 280.46061837, is itself the
 *  defining GMST value at the J2000.0 epoch, which is a useful sanity
 *  check on this formula's correctness). */
function gmstDeg(date: Date): number {
  const d = julianDay(date) - 2451545.0;
  const T = d / 36525;
  return norm360(280.46061837 + 360.98564736629 * d + 0.000387933 * T * T - (T * T * T) / 38710000);
}

/** A point ON the ecliptic (latitude 0) at longitude lambda -> equatorial RA/Dec, degrees. */
function eclipticToEquatorial(lambdaDeg: number, obliquityDeg: number): { ra: number; dec: number } {
  const lambda = toRad(lambdaDeg);
  const eps = toRad(obliquityDeg);
  const dec = Math.asin(Math.sin(eps) * Math.sin(lambda));
  const ra = norm360(toDeg(Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda))));
  return { ra, dec: toDeg(dec) };
}

/** Altitude above the horizon, degrees, for an equatorial point given Local
 *  Sidereal Time and observer latitude (standard spherical-astronomy
 *  formula). */
function altitudeDeg(raDeg: number, decDeg: number, lstDeg: number, latDeg: number): number {
  const hourAngle = toRad(norm360(lstDeg - raDeg + 180) - 180);
  const dec = toRad(decDeg);
  const lat = toRad(latDeg);
  const sinAlt = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(hourAngle);
  return toDeg(Math.asin(Math.max(-1, Math.min(1, sinAlt))));
}

/**
 * The real Ascendant's ecliptic longitude (0-360°): the point on the
 * ecliptic currently rising on the eastern horizon, given a precise birth
 * instant (UTC) and the geocoded birth latitude/longitude.
 *
 * Deliberately solved NUMERICALLY (scan the ecliptic for where its
 * altitude crosses the horizon while rising, then refine by bisection)
 * rather than from a single closed-form trig formula recalled from memory
 * — each individual building block here (obliquity, GMST, ecliptic <->
 * equatorial <-> horizontal conversions) is a standard, independently
 * low-risk textbook formula, and this was verified before being written
 * here: GMST matches the formula's own J2000.0 reference value, the
 * Ascendant and Descendant always come out ~180° apart across six very
 * different lat/lon/date combinations, and the Ascendant advances forward
 * through the zodiac hour by hour, as it should.
 *
 * Returns null only in the degenerate case of no horizon crossing at all
 * (effectively only possible extremely close to the poles) — callers
 * should fall back to estimateAscendant in that case.
 */
export function getRealAscendantLongitude(
  birthInstantUtc: Date,
  latitudeDeg: number,
  longitudeDeg: number
): number | null {
  const centuriesSinceJ2000 = (julianDay(birthInstantUtc) - 2451545.0) / 36525;
  const obliquity = meanObliquityDeg(centuriesSinceJ2000);
  const lst = norm360(gmstDeg(birthInstantUtc) + longitudeDeg);

  const altitudeAtLambda = (lambda: number) => {
    const { ra, dec } = eclipticToEquatorial(lambda, obliquity);
    return altitudeDeg(ra, dec, lst, latitudeDeg);
  };

  const STEP_DEG = 0.25;
  let prevLambda = 0;
  let prevAlt = altitudeAtLambda(0);
  for (let lambda = STEP_DEG; lambda <= 360; lambda += STEP_DEG) {
    const alt = altitudeAtLambda(lambda);
    if (prevAlt < 0 && alt >= 0) {
      // Found the rising crossing (altitude going from below to above the
      // horizon) — refine its exact longitude by bisection.
      let lo = prevLambda;
      let hi = lambda;
      let altAtLo = prevAlt;
      for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2;
        const altAtMid = altitudeAtLambda(mid);
        if ((altAtLo < 0) === (altAtMid < 0)) {
          lo = mid;
          altAtLo = altAtMid;
        } else {
          hi = mid;
        }
      }
      return norm360((lo + hi) / 2);
    }
    prevLambda = lambda;
    prevAlt = alt;
  }
  return null;
}

/** Real Ascendant sign — see getRealAscendantLongitude for how it's computed
 *  and verified. Returns null in the same degenerate case that function
 *  does; callers should fall back to estimateAscendant then. */
export function getRealAscendant(
  birthInstantUtc: Date,
  latitudeDeg: number,
  longitudeDeg: number
): ZodiacSign | null {
  const lambda = getRealAscendantLongitude(birthInstantUtc, latitudeDeg, longitudeDeg);
  return lambda === null ? null : signForLongitude(lambda);
}

export type AscendantResolution = {
  sign: ZodiacSign;
  isReal: boolean;
  /** Exact ecliptic longitude (0-360°), only set when isReal — callers that
   *  only need the sign (Whole Sign houses, passport card) can ignore it;
   *  FullChartWheel uses it to place the Ascendant marker at its true
   *  degree instead of the sign midpoint when it's real. */
  longitude: number | null;
};

/**
 * Single entry point every screen should use to get an Ascendant: real
 * (getRealAscendant) whenever the profile has a geocoded lat/lon/timezone
 * AND buildPreciseBirthInstant/getRealAscendant both succeed, otherwise the
 * honest estimateAscendant fallback — with isReal telling the caller which
 * one it got, so UI can show/hide the "Estimated" caveat accordingly.
 */
export function resolveAscendant(
  sunSign: ZodiacSign,
  birthHour: number,
  birthDateIso: string,
  birthTime: string | null,
  birthLat: number | null,
  birthLon: number | null,
  birthTimezone: string | null
): AscendantResolution {
  if (birthLat != null && birthLon != null && birthTimezone) {
    const { instant, isPrecise } = buildPreciseBirthInstant(birthDateIso, birthTime, birthTimezone);
    if (isPrecise) {
      const longitude = getRealAscendantLongitude(instant, birthLat, birthLon);
      if (longitude !== null) {
        return { sign: signForLongitude(longitude), isReal: true, longitude };
      }
    }
  }
  return { sign: estimateAscendant(sunSign, birthHour), isReal: false, longitude: null };
}

/**
 * Builds the best current estimate of the birth instant as a JS Date, for
 * feeding into the real ephemeris functions below (getMoonSign,
 * getSunEclipticLongitude).
 *
 * KNOWN LIMITATION (natal-chart Stage 1): birthCity isn't geocoded yet, so
 * there's no known timezone for the birth location — birthTime is treated
 * as if it were UTC. That's wrong by the person's real UTC offset (up to
 * ~14h), which the Sun position barely notices (the Sun moves ~1°/day) but
 * can occasionally shift the Moon by one sign for a birth time close to a
 * sign-change boundary (the Moon moves ~13°/day, so ~14h of error is up to
 * ~7.6° of longitude). Stage 2 (geocoding birthCity → a real timezone)
 * removes this caveat and is also the hard prerequisite for a real
 * Ascendant/Houses (see estimateAscendant above) — it isn't optional.
 */
export function buildBirthInstant(birthDateIso: string, birthTime: string | null): Date {
  const [y, m, d] = birthDateIso.split("-").map((n) => parseInt(n, 10));
  let hour = 12;
  let minute = 0; // noon is the conventional "unknown birth time" placeholder
  if (birthTime) {
    const [h, min] = birthTime.split(":").map((n) => parseInt(n, 10));
    if (!Number.isNaN(h)) hour = h;
    if (!Number.isNaN(min)) minute = min;
  }
  return new Date(Date.UTC(y || 2000, (m || 1) - 1, d || 1, hour, minute));
}

/** The UTC offset (minutes, east positive) that `timeZone` actually observed
 *  at `instant` — not necessarily the zone's offset today, since historical
 *  DST rules/political changes shift it. Uses only Intl.DateTimeFormat
 *  (no bundled tz-rule data needed), via the standard "format in both UTC
 *  and the target zone, diff the wall-clock fields" trick. Relies on the JS
 *  engine's Intl having full IANA tz data — Hermes on Expo SDK 51/RN 0.74
 *  should, but this is worth confirming on-device. */
function timezoneOffsetMinutesAt(timeZone: string, instant: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts: Record<string, string> = {};
  for (const part of dtf.formatToParts(instant)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }
  const asIfUtc = Date.UTC(
    parseInt(parts.year, 10),
    parseInt(parts.month, 10) - 1,
    parseInt(parts.day, 10),
    parseInt(parts.hour, 10),
    parseInt(parts.minute, 10),
    parseInt(parts.second, 10)
  );
  return (asIfUtc - instant.getTime()) / 60000;
}

/**
 * Natal-chart Stage 2: the real birth instant, correctly converting the
 * wall-clock birth date/time in the geocoded IANA timezone to UTC — unlike
 * buildBirthInstant above, which has no timezone to work with and treats
 * the wall-clock time as if it were already UTC. Resolves the offset in
 * two passes (guess, then re-check at the corrected instant) so a birth
 * time within a couple hours of a historical DST transition still gets the
 * right side of it. Falls back to buildBirthInstant (and returns
 * isPrecise: false) if timezone is missing or Intl can't resolve it for
 * any reason — callers should treat that the same as "estimate", not throw.
 */
export function buildPreciseBirthInstant(
  birthDateIso: string,
  birthTime: string | null,
  timezone: string | null
): { instant: Date; isPrecise: boolean } {
  if (!timezone) return { instant: buildBirthInstant(birthDateIso, birthTime), isPrecise: false };

  try {
    const [y, m, d] = birthDateIso.split("-").map((n) => parseInt(n, 10));
    let hour = 12;
    let minute = 0;
    if (birthTime) {
      const [h, min] = birthTime.split(":").map((n) => parseInt(n, 10));
      if (!Number.isNaN(h)) hour = h;
      if (!Number.isNaN(min)) minute = min;
    }
    const guessMs = Date.UTC(y || 2000, (m || 1) - 1, d || 1, hour, minute);
    const offset1 = timezoneOffsetMinutesAt(timezone, new Date(guessMs));
    let utcMs = guessMs - offset1 * 60000;
    const offset2 = timezoneOffsetMinutesAt(timezone, new Date(utcMs));
    if (offset2 !== offset1) utcMs = guessMs - offset2 * 60000;
    return { instant: new Date(utcMs), isPrecise: true };
  } catch {
    return { instant: buildBirthInstant(birthDateIso, birthTime), isPrecise: false };
  }
}

/** Geocentric tropical ecliptic longitude (0-360°) of a body at a given
 *  instant — real astronomical positions (VSOP87/ELP2000 via
 *  astronomy-engine), not an approximation. */
function eclipticLongitudeOf(body: Astronomy.Body, date: Date): number {
  const vec = Astronomy.GeoVector(body, date, true);
  const ecl = Astronomy.Ecliptic(vec);
  return ((ecl.elon % 360) + 360) % 360;
}

function signForLongitude(elon: number): ZodiacSign {
  const idx = Math.floor((((elon % 360) + 360) % 360) / 30);
  return ZODIAC_SIGNS[idx];
}

/** Real Moon sign at a birth instant, from an ephemeris-accurate geocentric
 *  ecliptic longitude (replaces the previous arbitrary ~2.5-day-cycle
 *  placeholder). See buildBirthInstant() for the current timezone caveat
 *  this still carries until Stage 2 lands. */
export function getMoonSign(birthInstant: Date): ZodiacSign {
  return signForLongitude(eclipticLongitudeOf(Astronomy.Body.Moon, birthInstant));
}

/** Real Sun ecliptic longitude (0-360°) at a birth instant. The Sun SIGN
 *  itself is already accurate from the calendar date alone (getZodiacSign
 *  above) and stays the canonical source for it — this is for a future
 *  "exact degree in sign" display (e.g. "14° Leo"). */
export function getSunEclipticLongitude(birthInstant: Date): number {
  return eclipticLongitudeOf(Astronomy.Body.Sun, birthInstant);
}

const PLANET_BODY: Record<PlanetKey, Astronomy.Body> = {
  sun: Astronomy.Body.Sun,
  moon: Astronomy.Body.Moon,
  mercury: Astronomy.Body.Mercury,
  venus: Astronomy.Body.Venus,
  mars: Astronomy.Body.Mars,
  jupiter: Astronomy.Body.Jupiter,
  saturn: Astronomy.Body.Saturn,
  uranus: Astronomy.Body.Uranus,
  neptune: Astronomy.Body.Neptune,
  pluto: Astronomy.Body.Pluto,
};

export type NatalPlacement = {
  key: PlanetKey;
  /** 0-360°, geocentric tropical ecliptic longitude. */
  longitude: number;
  sign: ZodiacSign;
  /** 0-30°, position within that sign. */
  degreeInSign: number;
};

/**
 * The full real-ephemeris chart: all ten bodies (Sun, Moon, and the eight
 * planets) at a birth instant, each with its real sign and exact degree —
 * same accuracy and the same timezone caveat as getMoonSign (see
 * buildBirthInstant's doc comment). Deliberately does NOT include the
 * Ascendant: that's a different kind of calculation (Local Sidereal Time +
 * birth latitude, not just "where is this body"), and it needs a geocoded
 * birth location this function has no access to — see estimateAscendant's
 * doc comment. Callers that want to show Ascendant alongside this should
 * keep using estimateAscendant and label it as an estimate, same as today.
 */
export function getNatalPlacements(birthInstant: Date): NatalPlacement[] {
  return PLANET_KEYS.map((key) => {
    const longitude = eclipticLongitudeOf(PLANET_BODY[key], birthInstant);
    return {
      key,
      longitude,
      sign: signForLongitude(longitude),
      degreeInSign: longitude % 30,
    };
  });
}

/**
 * Whole Sign house number (1-12) for a given sign, given the Ascendant's
 * sign: House 1 is the Ascendant's entire sign, House 2 the next sign
 * around the wheel, and so on. This is the one house system that only
 * needs the Ascendant's SIGN rather than its exact degree (every other
 * system — Placidus, Koch, Equal House from the precise cusp, etc. — needs
 * real Local Sidereal Time, which needs the geocoded birth location we
 * don't have yet). So it carries exactly the same uncertainty as the
 * Ascendant estimate itself, no more — see estimateAscendant's doc comment.
 */
export function getWholeSignHouse(sign: ZodiacSign, ascendantSign: ZodiacSign): number {
  const signIdx = ZODIAC_SIGNS.indexOf(sign);
  const ascIdx = ZODIAC_SIGNS.indexOf(ascendantSign);
  return ((signIdx - ascIdx + 12) % 12) + 1;
}

/**
 * Planetary aspects — the standard five major aspects (conjunction, sextile,
 * square, trine, opposition), computed from the same real `NatalPlacement`
 * longitudes `getNatalPlacements` already provides. No new astronomical
 * data is needed: an aspect is just the angular separation between two
 * bodies' ecliptic longitudes, classified against each aspect's exact
 * angle within a tolerance ("orb") — a textbook definition, not a
 * simplification of anything.
 *
 * Orbs used here (how many degrees off-exact still counts): conjunction
 * and opposition and trine 8°, square 7°, sextile 6° — standard,
 * commonly-used orb sizes for a natal chart read at this level of detail
 * (tighter software/professional charts sometimes narrow these further,
 * looser ones widen them; there's no single universal standard, so this is
 * a documented, reasonable choice rather than a claim to one exact
 * tradition's table).
 */
export type AspectType = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export const ASPECT_TYPES: AspectType[] = ["conjunction", "sextile", "square", "trine", "opposition"];

const ASPECT_EXACT_ANGLE: Record<AspectType, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

const ASPECT_ORB: Record<AspectType, number> = {
  conjunction: 8,
  sextile: 6,
  square: 7,
  trine: 8,
  opposition: 8,
};

export type NatalAspect = {
  a: PlanetKey;
  b: PlanetKey;
  type: AspectType;
  /** The actual angular separation (0-180°) between the two bodies. */
  separation: number;
  /** How far separation sits from the aspect's exact angle — 0 is exact. */
  orb: number;
};

function circularSeparationDeg(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
}

/**
 * Every pair of bodies within orb of one of the five major aspects, closest
 * match wins when a separation technically falls within two orbs at once
 * (only possible right at an orb's edge, and even then the closer one is
 * the correct read). Real charts typically surface somewhere around 8-15
 * aspects out of the 45 possible pairs among ten bodies — most pairs simply
 * aren't near any of the five exact angles.
 */
export function getNatalAspects(placements: NatalPlacement[]): NatalAspect[] {
  const aspects: NatalAspect[] = [];
  for (let i = 0; i < placements.length; i++) {
    for (let j = i + 1; j < placements.length; j++) {
      const separation = circularSeparationDeg(placements[i].longitude, placements[j].longitude);
      let best: { type: AspectType; orb: number } | null = null;
      for (const type of ASPECT_TYPES) {
        const orb = Math.abs(separation - ASPECT_EXACT_ANGLE[type]);
        if (orb <= ASPECT_ORB[type] && (!best || orb < best.orb)) {
          best = { type, orb };
        }
      }
      if (best) {
        aspects.push({ a: placements[i].key, b: placements[j].key, type: best.type, separation, orb: best.orb });
      }
    }
  }
  return aspects;
}

export type CompatibilityResult = {
  percent: number;
  headline: string;
  blurb: string;
};

const ELEMENT_SYNERGY: Record<string, Record<string, number>> = {
  Fire: { Fire: 82, Earth: 58, Air: 90, Water: 52 },
  Earth: { Fire: 58, Earth: 80, Air: 54, Water: 88 },
  Air: { Fire: 90, Earth: 54, Air: 78, Water: 60 },
  Water: { Fire: 52, Earth: 88, Air: 60, Water: 85 },
};

/** Deterministic, illustrative zodiac compatibility score between two signs. */
export function getCompatibility(a: ZodiacSign, b: ZodiacSign): CompatibilityResult {
  const elA = ZODIAC_ELEMENT[a];
  const elB = ZODIAC_ELEMENT[b];
  const base = ELEMENT_SYNERGY[elA][elB];
  // Small deterministic jitter based on sign pairing so results feel specific, not just element-based.
  const order: ZodiacSign[] = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];
  const dist = Math.abs(order.indexOf(a) - order.indexOf(b));
  const harmonic = dist % 6 === 0 ? 10 : dist % 4 === 0 ? 6 : dist % 3 === 0 ? -4 : 0;
  const percent = Math.max(32, Math.min(98, base + harmonic));

  let headline = "A Curious Mix";
  if (percent >= 90) headline = "Cosmic Soulmates";
  else if (percent >= 78) headline = "Magnetic Pull";
  else if (percent >= 65) headline = "Steady Harmony";
  else if (percent >= 50) headline = "Worth the Work";
  else headline = "Growth Through Friction";

  const blurb =
    a === b
      ? `Two ${a} energies mirror each other — deep understanding, but watch for doubled blind spots.`
      : `${a} and ${b} blend ${elA.toLowerCase()} and ${elB.toLowerCase()} energy — ${
          percent >= 70 ? "an easy, energizing flow" : "a pairing that rewards patience and translation"
        } between how you each move through the world.`;

  return { percent, headline, blurb };
}

export type CompatibilityAreaKey = "love" | "communication" | "trust" | "intimacy" | "growth";

export type CompatibilityAreaResult = {
  key: CompatibilityAreaKey;
  percent: number;
  blurb: string;
};

export type CompatibilityReport = CompatibilityResult & {
  areas: CompatibilityAreaResult[];
  timing: string;
  advice: string;
};

/** Deterministic -spread..+spread offset from a string seed (same PRNG shape as getDailyIndexes). */
function seededOffset(seedStr: string, spread = 16): number {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
  const x = Math.sin(h) * 10000;
  const unit = x - Math.floor(x);
  return Math.round((unit - 0.5) * 2 * spread);
}

const AREA_KEYS: CompatibilityAreaKey[] = ["love", "communication", "trust", "intimacy", "growth"];

type AreaBlurbFn = (a: ZodiacSign, b: ZodiacSign, elA: string, elB: string, percent: number) => string;

const AREA_BLURBS: Record<CompatibilityAreaKey, AreaBlurbFn> = {
  love: (a, b, elA, elB, percent) =>
    percent >= 75
      ? `${a} and ${b} spark fast — there's a natural pull and plenty of romantic momentum here.`
      : percent >= 55
      ? `${a} and ${b} build attraction slowly, through shared moments rather than fireworks.`
      : `${a} and ${b} experience romance differently — patience and clear signals matter more than instinct here.`,
  communication: (a, b, elA, elB, percent) =>
    percent >= 75
      ? `You two tend to just "get" each other — conversation flows and misunderstandings are rare.`
      : percent >= 55
      ? `${a} and ${b} communicate in different rhythms — a little translation goes a long way.`
      : `Different ${elA.toLowerCase()}/${elB.toLowerCase()} styles mean you may need to actively check in rather than assume.`,
  trust: (a, b, elA, elB, percent) =>
    percent >= 75
      ? `Core values line up well — trust tends to build steadily and without much drama.`
      : percent >= 55
      ? `Trust grows here, but it's earned through consistency more than instinct.`
      : `You may value different things in a relationship — naming them explicitly builds trust faster than time alone.`,
  intimacy: (a, b, elA, elB, percent) =>
    percent >= 75
      ? `Physical and emotional closeness come easily — you read each other's cues well.`
      : percent >= 55
      ? `Intimacy deepens gradually as you learn each other's pace.`
      : `You may open up on different timelines — go slow and let trust lead intimacy, not the other way around.`,
  growth: (a, b, elA, elB, percent) =>
    percent >= 75
      ? `This pairing tends to push both people forward — you make each other better over time.`
      : percent >= 55
      ? `There's real long-term potential here if you both stay willing to adapt.`
      : `Growth is possible but will take deliberate effort from both sides — this isn't a pairing that coasts.`,
};

/** Full compatibility report: overall score plus a per-area breakdown, a timing
 *  read (anchored to today's moon phase) and one piece of actionable advice —
 *  deterministic from the two signs + date, same illustrative approach as
 *  getCompatibility/getDailyIndexes (no ephemeris, but specific and consistent). */
export function getCompatibilityReport(a: ZodiacSign, b: ZodiacSign, date: Date = new Date()): CompatibilityReport {
  const base = getCompatibility(a, b);
  const elA = ZODIAC_ELEMENT[a];
  const elB = ZODIAC_ELEMENT[b];

  const areas: CompatibilityAreaResult[] = AREA_KEYS.map((key) => {
    const offset = seededOffset(`${a}-${b}-${key}`, 16);
    const percent = Math.max(28, Math.min(99, base.percent + offset));
    return { key, percent, blurb: AREA_BLURBS[key](a, b, elA, elB, percent) };
  });

  const { phase } = getMoonPhase(date);
  const avgArea = Math.round(areas.reduce((sum, ar) => sum + ar.percent, 0) / areas.length);
  const strongest = areas.reduce((best, ar) => (ar.percent > best.percent ? ar : best), areas[0]);
  const weakest = areas.reduce((worst, ar) => (ar.percent < worst.percent ? ar : worst), areas[0]);

  const timing =
    phase === "New Moon" || phase === "Waxing Crescent"
      ? `The ${phase} favors new starts — a good window to open an honest conversation or plan a next date.`
      : phase === "Full Moon" || phase === "Waxing Gibbous"
      ? `The ${phase} amplifies what's already present between you — lean into ${strongest.key}, it's your strongest thread right now.`
      : `The ${phase} favors reflection over big moves — a quiet, low-pressure moment will land better than a grand gesture.`;

  const advice =
    avgArea >= 75
      ? `This is a pairing that works more often than it doesn't — keep nurturing ${strongest.key}, and don't take the ease for granted.`
      : avgArea >= 55
      ? `Focus your energy on ${weakest.key} — it's the area with the most room to grow, and small, consistent effort there will shift the whole dynamic.`
      : `This connection will take real work, especially around ${weakest.key} — that's not a reason to walk away, but it is a reason to go in with open eyes and clear communication.`;

  return { ...base, areas, timing, advice };
}

export type MoonPhase =
  | "New Moon"
  | "Waxing Crescent"
  | "First Quarter"
  | "Waxing Gibbous"
  | "Full Moon"
  | "Waning Gibbous"
  | "Last Quarter"
  | "Waning Crescent";

const SYNODIC_MONTH = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14); // Jan 6 2000 new moon (UTC)

/** Returns the current moon phase name and illumination fraction (0-1). */
export function getMoonPhase(date: Date = new Date()): { phase: MoonPhase; illumination: number; age: number } {
  const diffDays = (date.getTime() - KNOWN_NEW_MOON) / 86400000;
  const age = ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const illumination = (1 - Math.cos((2 * Math.PI * age) / SYNODIC_MONTH)) / 2;

  let phase: MoonPhase;
  if (age < 1.84566) phase = "New Moon";
  else if (age < 5.53699) phase = "Waxing Crescent";
  else if (age < 9.22831) phase = "First Quarter";
  else if (age < 12.91963) phase = "Waxing Gibbous";
  else if (age < 16.61096) phase = "Full Moon";
  else if (age < 20.30228) phase = "Waning Gibbous";
  else if (age < 23.99361) phase = "Last Quarter";
  else if (age < 27.68493) phase = "Waning Crescent";
  else phase = "New Moon";

  return { phase, illumination, age };
}

export const MOON_PHASE_GUIDANCE: Record<MoonPhase, string> = {
  "New Moon": "A blank page. Ideal for setting intentions and planting quiet new seeds.",
  "Waxing Crescent": "Momentum is building — take the first small, concrete step on an intention.",
  "First Quarter": "Friction shows you what's real. Push through resistance on a goal.",
  "Waxing Gibbous": "Refine and adjust. Review what's working before the peak.",
  "Full Moon": "Peak illumination — ideal for a resentment-release meditation and space cleansing.",
  "Waning Gibbous": "Give thanks. Share what you've learned with someone who needs it.",
  "Last Quarter": "Release what no longer serves you. A natural time to let go.",
  "Waning Crescent": "Rest and reflect. Surrender before the next cycle begins.",
};

/** Daily indexes (energy, intuition, tension, luck) derived deterministically from sign + date. */
export function getDailyIndexes(sign: ZodiacSign, date: Date = new Date()) {
  const seed = `${sign}-${date.toDateString()}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = (offset: number) => {
    const x = Math.sin(h + offset) * 10000;
    return x - Math.floor(x);
  };
  const clamp = (n: number) => Math.round(Math.max(18, Math.min(97, n)));
  return {
    energy: clamp(50 + rand(1) * 50 - 10),
    intuition: clamp(50 + rand(2) * 50 - 5),
    tension: clamp(30 + rand(3) * 45),
    luck: clamp(40 + rand(4) * 55),
  };
}
