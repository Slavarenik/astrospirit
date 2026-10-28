/**
 * Life Path Number calculations — generic Western digit-sum-reduction
 * numerology (the same base technique behind "Life Path Number",
 * "Pythagorean square", etc.), not tied to any single branded system.
 *
 * Two numbers are computed from the birth date (ISO "YYYY-MM-DD"):
 *  - Consciousness Number: reduces the day-of-birth alone. Reads as the
 *    person's instinctive core — ego, reflexes, how they move through life.
 *  - Mission Number: reduces the sum of every digit in the full date.
 *    Reads as the underlying purpose/lesson the person grows into.
 *
 * Both reductions preserve the Western "master numbers" 11 and 22 — if an
 * intermediate sum lands exactly on one, reduction stops there instead of
 * collapsing it further to a single digit.
 */

function sumDigits(n: number): number {
  return String(Math.abs(Math.trunc(n)))
    .split("")
    .reduce((acc, d) => acc + Number(d), 0);
}

/** Repeatedly sums digits until a single digit 1-9 remains, unless the sum
 *  lands on a master number (11 or 22), in which case it stops there. */
export function reduceToNumerologyNumber(n: number, allowMaster = true): number {
  let value = Math.abs(Math.trunc(n));
  while (value > 9 && !(allowMaster && (value === 11 || value === 22))) {
    value = sumDigits(value);
  }
  return value;
}

function dayOfMonthFromISO(birthDateISO: string): number {
  const parts = birthDateISO.split("-");
  return parseInt(parts[2] ?? parts[parts.length - 1], 10);
}

/** Consciousness Number — the day of birth, reduced. */
export function getConsciousnessNumber(birthDateISO: string, allowMaster = true): number {
  return reduceToNumerologyNumber(dayOfMonthFromISO(birthDateISO), allowMaster);
}

/** Mission Number — every digit of the full birth date, summed then reduced. */
export function getMissionNumber(birthDateISO: string, allowMaster = true): number {
  const digitsSum = birthDateISO
    .replace(/\D/g, "")
    .split("")
    .reduce((acc, d) => acc + Number(d), 0);
  return reduceToNumerologyNumber(digitsSum, allowMaster);
}

/** The full set of values either number can resolve to, in display order. */
export const NUMEROLOGY_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22] as const;
export type NumerologyValue = (typeof NUMEROLOGY_VALUES)[number];

export function isMasterNumber(n: number): boolean {
  return n === 11 || n === 22;
}

/**
 * Name-based numbers — the classic Pythagorean letter-value system
 * (A=1,B=2,...I=9, J=1,K=2,...R=9, S=1,...Z=8), the same generic technique
 * behind Western "Destiny"/"Expression", "Soul Urge" and "Personality"
 * numbers. The table only has values for A-Z, so these only work on the
 * Latin-letter part of a name — a name with no Latin letters at all (e.g.
 * written purely in Cyrillic) has no defined value and these return `null`
 * rather than guess at an unverified non-Latin letter-value table.
 */
const LETTER_VALUES: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

function latinLettersOnly(name: string): string[] {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents so "José" still maps its letters
    .split("")
    .filter((ch) => LETTER_VALUES[ch] !== undefined);
}

/** Destiny Number — every Latin letter in the full name, summed by its
 *  Pythagorean value and reduced. `null` if the name has no Latin letters. */
export function getDestinyNumber(fullName: string, allowMaster = true): number | null {
  const letters = latinLettersOnly(fullName);
  if (letters.length === 0) return null;
  const sum = letters.reduce((acc, ch) => acc + LETTER_VALUES[ch], 0);
  return reduceToNumerologyNumber(sum, allowMaster);
}

/** Soul Urge Number — only the vowels (A,E,I,O,U) of the name. */
export function getSoulUrgeNumber(fullName: string, allowMaster = true): number | null {
  const letters = latinLettersOnly(fullName).filter((ch) => VOWELS.has(ch));
  if (letters.length === 0) return null;
  const sum = letters.reduce((acc, ch) => acc + LETTER_VALUES[ch], 0);
  return reduceToNumerologyNumber(sum, allowMaster);
}

/** Personality Number — only the consonants of the name. */
export function getPersonalityNumber(fullName: string, allowMaster = true): number | null {
  const letters = latinLettersOnly(fullName).filter((ch) => !VOWELS.has(ch));
  if (letters.length === 0) return null;
  const sum = letters.reduce((acc, ch) => acc + LETTER_VALUES[ch], 0);
  return reduceToNumerologyNumber(sum, allowMaster);
}

/**
 * Personal Year Number — birth day + birth month + a given year (default:
 * this year), each reduced on its own and then summed and reduced again.
 * Conventionally always a single digit 1-9 — master numbers are not kept
 * for this one, unlike the others above.
 */
export function getPersonalYearNumber(birthDateISO: string, year: number = new Date().getFullYear()): number {
  const parts = birthDateISO.split("-");
  const day = parseInt(parts[2] ?? "1", 10);
  const month = parseInt(parts[1] ?? "1", 10);
  const dayReduced = reduceToNumerologyNumber(day, false);
  const monthReduced = reduceToNumerologyNumber(month, false);
  const yearReduced = reduceToNumerologyNumber(year, false);
  return reduceToNumerologyNumber(dayReduced + monthReduced + yearReduced, false);
}

/**
 * Personal Month and Personal Day Numbers — the same generic technique
 * carried one level further than Personal Year: each period folds the
 * previous one in. Personal Month reduces (Personal Year + the calendar
 * month); Personal Day reduces (Personal Month + the calendar day). Like
 * Personal Year, master numbers are not kept at either step — standard for
 * this technique, since these are meant to read as one of nine everyday
 * "weather" tones rather than a core trait.
 */
export function getPersonalMonthNumber(birthDateISO: string, date: Date = new Date()): number {
  const personalYear = getPersonalYearNumber(birthDateISO, date.getFullYear());
  const monthReduced = reduceToNumerologyNumber(date.getMonth() + 1, false);
  return reduceToNumerologyNumber(personalYear + monthReduced, false);
}

export function getPersonalDayNumber(birthDateISO: string, date: Date = new Date()): number {
  const personalMonth = getPersonalMonthNumber(birthDateISO, date);
  const dayReduced = reduceToNumerologyNumber(date.getDate(), false);
  return reduceToNumerologyNumber(personalMonth + dayReduced, false);
}

/**
 * Personal Day "weather" scores — three 0-100 readings (focus/energy,
 * finance & career favorability, relationship favorability) for each of
 * the nine Personal Day numbers. These are this app's own deterministic
 * reading of the day numbers' well-known generic meanings (1 = beginnings
 * and leadership, 8 = money and business, 6 = home and family, etc.) —
 * not a transcription of any named tradition's chart, the same spirit as
 * the zodiac Match screen's element-synergy scores. Day 1-9 only; Personal
 * Day never produces a master number (see above), so there's nothing to
 * fill in for 11/22.
 */
export type PersonalDayScores = { focus: number; finance: number; relationships: number };

const PERSONAL_DAY_SCORES: Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, PersonalDayScores> = {
  1: { focus: 90, finance: 60, relationships: 45 },
  2: { focus: 50, finance: 55, relationships: 85 },
  3: { focus: 75, finance: 45, relationships: 75 },
  4: { focus: 80, finance: 70, relationships: 40 },
  5: { focus: 60, finance: 55, relationships: 55 },
  6: { focus: 55, finance: 50, relationships: 90 },
  7: { focus: 70, finance: 35, relationships: 30 },
  8: { focus: 75, finance: 90, relationships: 45 },
  9: { focus: 55, finance: 40, relationships: 55 },
};

export function getPersonalDayScores(personalDay: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9): PersonalDayScores {
  return PERSONAL_DAY_SCORES[personalDay];
}

/**
 * Pythagorean Square ("квадрат Пифагора" / Alexandrov's psychomatrix) — a
 * classic generic technique distinct from the digit-sum-reduction numbers
 * above: instead of reducing the birth date to one digit, it counts how
 * many times each digit 1-9 appears across the date and a few numbers
 * derived from it, then reads the counts as a 3x3 grid.
 *
 * Steps (standard method): write the date as DDMMYYYY digits (s1); a = sum
 * of s1's digits; b = sum of a's digits; c = a minus twice a's first digit;
 * d = sum of c's digits. Concatenate s1+a+b+c+d into one working digit
 * string and count how often each digit 1-9 appears in it (zeros are
 * dropped, as in the classic method). Those nine counts fill a fixed grid
 * (columns 1-2-3 / 4-5-6 / 7-8-9), and rows/columns/diagonals are
 * traditionally read as named traits.
 *
 * **Edge case not addressed by the textbook description**: for a very
 * low-digit-sum date (e.g. 2000-01-01, where a is itself a single digit),
 * `c` can come out negative — handled here by taking its absolute value
 * before counting its digits, a deliberate, documented choice rather than
 * an attempt to fabricate what the classic sources don't cover.
 */
export type PythagoreanTraitKey =
  | "character"
  | "energy"
  | "duty"
  | "health"
  | "logic"
  | "labor"
  | "selfEsteem"
  | "family";

export type PythagoreanSquare = {
  counts: Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, number>;
  traits: Record<PythagoreanTraitKey, number>;
};

export function computePythagoreanSquare(birthDateISO: string): PythagoreanSquare {
  const parts = birthDateISO.split("-"); // [YYYY, MM, DD]
  const day = parts[2] ?? "01";
  const month = parts[1] ?? "01";
  const year = parts[0] ?? "2000";
  const s1 = `${day}${month}${year}`;

  const sumStr = (s: string) => s.split("").reduce((acc, d) => acc + Number(d), 0);

  const aNum = sumStr(s1);
  const bNum = sumStr(String(aNum));
  const firstDigitOfA = Number(String(aNum)[0]);
  const cNum = aNum - 2 * firstDigitOfA;
  const dNum = sumStr(String(Math.abs(cNum)));

  const working = `${s1}${aNum}${bNum}${Math.abs(cNum)}${dNum}`;

  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 } as Record<
    1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
    number
  >;
  for (const ch of working) {
    const d = Number(ch);
    if (d >= 1 && d <= 9) counts[d as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9] += 1;
  }

  return {
    counts,
    traits: {
      character: counts[1] + counts[4] + counts[7], // row 1
      energy: counts[2] + counts[5] + counts[8], // row 2
      duty: counts[3] + counts[6] + counts[9], // row 3
      health: counts[1] + counts[2] + counts[3], // col 1
      logic: counts[4] + counts[5] + counts[6], // col 2
      labor: counts[7] + counts[8] + counts[9], // col 3
      selfEsteem: counts[1] + counts[5] + counts[9], // main diagonal
      family: counts[3] + counts[5] + counts[7], // anti-diagonal
    },
  };
}

export const PYTHAGOREAN_TRAIT_KEYS: PythagoreanTraitKey[] = [
  "character",
  "energy",
  "duty",
  "health",
  "logic",
  "labor",
  "selfEsteem",
  "family",
];

/** Buckets a trait's raw count into a 3-level read — the classic method
 *  interprets 0 as a gap to develop, a middling count as balanced, and a
 *  high count as a dominant/excess trait. */
export function pythagoreanTraitLevel(count: number): "low" | "balanced" | "strong" {
  if (count <= 1) return "low";
  if (count <= 3) return "balanced";
  return "strong";
}

/**
 * Hidden Talents — reuses the Pythagorean Square's digit counts rather than
 * a separate calculation: whichever digit(s) 1-9 reach the "strong" count
 * threshold (>3, same bucket as `pythagoreanTraitLevel`) are read as a
 * natural, well-developed gift. Returns an empty array when nothing clears
 * the threshold (a person's digits can be evenly spread with no standout) —
 * callers should show a "no single dominant talent" message rather than
 * treat an empty array as an error.
 */
export function getHiddenTalentDigits(birthDateISO: string): number[] {
  const { counts } = computePythagoreanSquare(birthDateISO);
  const THRESHOLD = 4;
  return (Object.keys(counts) as unknown as (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[])
    .map((k) => Number(k) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)
    .filter((d) => counts[d] >= THRESHOLD)
    .sort((a, b) => counts[b] - counts[a]);
}

/**
 * Karmic Lesson Numbers — a different, standard generic technique from the
 * name-letter system above: instead of summing letter values, it looks at
 * *which* digits 1-9 the Pythagorean letter-value table never produces for
 * this name at all. A missing digit is read as an undeveloped area — a
 * "lesson" the person hasn't had practice with through their name. `null`
 * for the same reason as the other name-based numbers: no Latin letters,
 * no defined value.
 */
export function getKarmicLessonNumbers(fullName: string): number[] | null {
  const letters = latinLettersOnly(fullName);
  if (letters.length === 0) return null;
  const present = new Set(letters.map((ch) => LETTER_VALUES[ch]));
  const missing: number[] = [];
  for (let d = 1; d <= 9; d++) {
    if (!present.has(d)) missing.push(d);
  }
  return missing;
}

/**
 * Pinnacle Cycles ("life stages") — four successive periods, each read
 * through a single reduced number, covering a birth-to-death span. Standard
 * generic method: with month(M)/day(D)/year(Y) each reduced on their own,
 * Pinnacle 1 = reduce(M+D), Pinnacle 2 = reduce(D+Y), Pinnacle 3 =
 * reduce(P1+P2), Pinnacle 4 = reduce(M+Y) — master numbers preserved
 * throughout, unlike Personal Year.
 *
 * Age ranges follow the common "36 minus Life Path" rule for when the first
 * cycle ends, each later cycle running 9 years, and the fourth running to
 * the end of life. **Documented judgment call**: when the Life Path number
 * (the full birth date reduced, i.e. `getMissionNumber`) is a master number,
 * sources don't agree on whether to use 11/22 or their reduced form (2/4) in
 * this one subtraction — this reduces it, since using 11 or 22 directly can
 * push the first cycle's end past age 36 in a way most sources don't show.
 */
export type PinnacleCycle = { number: number; startAge: number; endAge: number | null };

export function getPinnacleCycles(birthDateISO: string): PinnacleCycle[] {
  const parts = birthDateISO.split("-");
  const year = parseInt(parts[0] ?? "2000", 10);
  const month = parseInt(parts[1] ?? "1", 10);
  const day = parseInt(parts[2] ?? "1", 10);

  const monthR = reduceToNumerologyNumber(month);
  const dayR = reduceToNumerologyNumber(day);
  const yearR = reduceToNumerologyNumber(year);

  const p1 = reduceToNumerologyNumber(monthR + dayR);
  const p2 = reduceToNumerologyNumber(dayR + yearR);
  const p3 = reduceToNumerologyNumber(p1 + p2);
  const p4 = reduceToNumerologyNumber(monthR + yearR);

  const lifePath = getMissionNumber(birthDateISO);
  const lifePathForAge = lifePath === 11 ? 2 : lifePath === 22 ? 4 : lifePath;
  const firstEnd = 36 - lifePathForAge;
  const secondEnd = firstEnd + 9;
  const thirdEnd = secondEnd + 9;

  return [
    { number: p1, startAge: 0, endAge: firstEnd },
    { number: p2, startAge: firstEnd, endAge: secondEnd },
    { number: p3, startAge: secondEnd, endAge: thirdEnd },
    { number: p4, startAge: thirdEnd, endAge: null },
  ];
}

/**
 * Numerology compatibility — reads two Life Path numbers (see
 * `getMissionNumber`, the full birth date reduced) against each other, in
 * the same spirit as `getCompatibility()` for zodiac signs: a transparent,
 * deterministic rule rather than a claim to any one author's "official"
 * compatibility table. Life Path is used (not Destiny/Soul Urge/Personality)
 * because it's the one number both people always have — no Latin name
 * required — matching the zodiac version's own "only one input needed"
 * simplicity.
 *
 * The two numbers are treated as points on a 1-9 ring (master numbers 11
 * and 22 reduced to their root, 2 and 4, for this one comparison only); the
 * closer two numbers sit on that ring, the more aligned their energy reads
 * as. This is a generic heuristic, not a specific named tradition's chart.
 */
export type NumerologyCompatibilityResult = { percent: number; headline: string; blurb: string };

function lifePathRootForDistance(n: number): number {
  return n === 11 ? 2 : n === 22 ? 4 : n;
}

export function getNumerologyCompatibility(a: NumerologyValue, b: NumerologyValue): NumerologyCompatibilityResult {
  const ra = lifePathRootForDistance(a);
  const rb = lifePathRootForDistance(b);
  const raw = Math.abs(ra - rb);
  const dist = Math.min(raw, 9 - raw);
  const percent = Math.max(40, Math.min(97, 95 - dist * 13));

  let headline: string;
  if (percent >= 90) headline = "Mirrored Numbers";
  else if (percent >= 78) headline = "Natural Resonance";
  else if (percent >= 65) headline = "Steady Alignment";
  else if (percent >= 50) headline = "Worth Translating";
  else headline = "Growth Through Contrast";

  const blurb =
    a === b
      ? `You share the same Life Path number — an easy, almost instinctive understanding, with the risk of doubling each other's blind spots.`
      : `Life Path ${a} and Life Path ${b} read as ${
          percent >= 70
            ? "a naturally compatible pairing — your core drives line up more often than not"
            : percent >= 50
            ? "a pairing that takes some translation, but has real common ground once you find it"
            : "a pairing built on contrast — expect to deliberately meet in the middle more often than not"
        }.`;

  return { percent, headline, blurb };
}
