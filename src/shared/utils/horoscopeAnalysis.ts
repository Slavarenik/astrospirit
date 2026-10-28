/**
 * Derives the energy / intuition / tension / luck gauge values shown under
 * the horoscope paragraph FROM that paragraph's own (English, pre-
 * translation) text — a lightweight on-device heuristic in the same spirit
 * as `sentiment.ts`'s journal analyzer, standing in for a real text-AI
 * scoring call. Swap `analyzeHoroscopeIndexes` for a real API call later;
 * the signature (text, sign, date) → four 0-100 numbers can stay the same.
 *
 * Each axis is a small deterministic base + keyword matches in the
 * horoscope text (both "pushes it up" and "pulls it down" word lists) +
 * a seeded day/sign jitter so two readings with the same tone still move a
 * little day to day, rather than landing on an identical flat number.
 */

import { ZodiacSign } from "@shared/theme";

const ENERGY_UP = [
  "energy", "momentum", "bold", "drive", "motion", "spark", "ambitious",
  "fast", "active", "charge", "push", "vigor", "dynamic", "assertive",
  "burst", "ignite", "propel",
];
const ENERGY_DOWN = [
  "rest", "quiet", "slow", "tired", "pause", "stillness", "gentle",
  "patience", "conserve", "low-key", "short bursts", "honor the rhythm",
];

const INTUITION_UP = [
  "intuition", "insight", "clarity", "inner", "instinct", "sense",
  "reflect", "dream", "gut", "quiet knowing", "perceptive",
  "read between", "attention to what", "useful data",
];
const INTUITION_DOWN = [
  "confus", "unclear", "distract", "noise", "overthink", "second-guess",
];

const TENSION_UP = [
  "friction", "resist", "conflict", "tension", "pressure", "stress",
  "challenge", "clash", "difficult", "stuck", "avoid", "grip", "force",
  "frustrat", "dread", "circling",
];
const TENSION_DOWN = [
  "ease", "smooth", "flow", "calm", "settle", "loosen", "release",
  "relief", "harmony", "resolve", "easier",
];

const LUCK_UP = [
  "luck", "fortune", "opportunity", "favor", "windfall", "breakthrough",
  "align", "open door", "serendipit", "gift", "in your favor",
  "unexpected good", "ready to resolve", "loosen",
];
const LUCK_DOWN = [
  "delay", "setback", "missed", "closed door", "obstacle", "avoiding",
];

function countMatches(lower: string, words: string[]): number {
  return words.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0);
}

/** Same small seeded PRNG used elsewhere in this codebase (getDailyIndexes,
 *  getTodayTrackers) — deterministic per sign+date+offset. */
function seededUnit(seedStr: string, offset: number): number {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
  const x = Math.sin(h + offset) * 10000;
  return x - Math.floor(x);
}

function axisScore(
  lower: string,
  up: string[],
  down: string[],
  base: number,
  seed: string,
  offset: number,
  jitterSpan: number
): number {
  const matches = countMatches(lower, up) - countMatches(lower, down);
  const jitter = (seededUnit(seed, offset) - 0.5) * jitterSpan;
  return base + matches * 9 + jitter;
}

export type HoroscopeIndexes = {
  energy: number;
  intuition: number;
  tension: number;
  luck: number;
};

/** Analyzes the day's ENGLISH horoscope paragraph (run this before
 *  translating it) and returns the four gauge values the widget shows. */
export function analyzeHoroscopeIndexes(
  englishText: string,
  sign: ZodiacSign,
  date: Date
): HoroscopeIndexes {
  const lower = englishText.toLowerCase();
  const seed = `${sign}-indexes-${date.toDateString()}`;
  const clamp = (n: number, lo = 18, hi = 97) => Math.round(Math.max(lo, Math.min(hi, n)));

  return {
    energy: clamp(axisScore(lower, ENERGY_UP, ENERGY_DOWN, 58, seed, 1, 22)),
    intuition: clamp(axisScore(lower, INTUITION_UP, INTUITION_DOWN, 55, seed, 2, 20)),
    tension: clamp(axisScore(lower, TENSION_UP, TENSION_DOWN, 42, seed, 3, 24), 15, 92),
    luck: clamp(axisScore(lower, LUCK_UP, LUCK_DOWN, 48, seed, 4, 24)),
  };
}
