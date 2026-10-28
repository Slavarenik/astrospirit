import { ZodiacSign } from "@shared/theme";

/**
 * Hand-drawn line-art paths for each zodiac glyph, in a 24x24 viewBox,
 * stroke-only (no fill) so they read correctly at any size and tint to
 * whatever color the badge needs. These are simplified, iconographic
 * renderings of the traditional astrological symbols — drawn as vector
 * strokes rather than relying on the Unicode glyph character (which
 * renders inconsistently across platforms/fonts).
 */
export const ZODIAC_GLYPH_PATHS: Record<ZodiacSign, string[]> = {
  // Ram horns
  Aries: [
    "M7 17c-3-1-4-4-2.5-7C6 7 8 7.5 8.5 10c.6 2.6-1 5-1.5 7",
    "M17 17c3-1 4-4 2.5-7C18 7 16 7.5 15.5 10c-.6 2.6 1 5 1.5 7",
    "M8.5 10c0-3 1.5-5 3.5-5s3.5 2 3.5 5",
  ],
  // Bull head with horns
  Taurus: [
    "M5 5c0 3 2 5 5 5",
    "M19 5c0 3-2 5-5 5",
    "M12 10a6 6 0 100 12 6 6 0 000-12z",
  ],
  // Roman numeral II pillars
  Gemini: [
    "M7 5v14",
    "M17 5v14",
    "M5 5h5",
    "M14 5h5",
    "M5 19h5",
    "M14 19h5",
  ],
  // Crab / 69 spirals
  Cancer: [
    "M8 9a4 4 0 114 4",
    "M16 15a4 4 0 11-4-4",
    "M6 7a1 1 0 100-2 1 1 0 000 2z",
    "M18 17a1 1 0 100-2 1 1 0 000 2z",
  ],
  // Lion / mane loop with tail
  Leo: [
    "M9 9a4 4 0 118 0c0 3-2 4-2 7a3 3 0 11-3-3",
    "M15 20c1.5 0 2.5-1 2.5-2.5",
  ],
  // Virgin — M with looping tail
  Virgo: [
    "M4 7v10",
    "M4 7l3.5 7V7",
    "M11 7l3.5 7V7",
    "M11 7v7",
    "M14.5 14v3.5a2.5 2.5 0 102.5-2.5",
  ],
  // Scales
  Libra: [
    "M4 18h9",
    "M4 7h16",
    "M6 7c0 2.2 1.8 4 4 4",
    "M18 7c0 2.2-1.8 4-4 4",
    "M12 3v4",
  ],
  // Scorpion — M with barbed tail
  Scorpio: [
    "M4 7v10",
    "M4 7l3.5 7V7",
    "M11 7l3.5 7V7",
    "M11 7v7",
    "M14.5 14v4",
    "M14.5 18l2-2",
    "M16.5 16l1.5 1-1 2",
  ],
  // Archer's arrow
  Sagittarius: [
    "M5 19L19 5",
    "M19 5h-6",
    "M19 5v6",
    "M9 15l3 3",
  ],
  // Goat-fish
  Capricorn: [
    "M5 6c0 4 2 6 4 7-1 2 0 4 2 4s3-1.5 2.5-3.5",
    "M9 13c3 1 6-1 6-4",
    "M15 9a2.5 2.5 0 112.5 2.5c-1.5 0-2.5 1-2.5 2.5a2 2 0 002 2",
  ],
  // Water-bearer waves
  Aquarius: [
    "M3 9c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0",
    "M3 15c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0",
  ],
  // Two fish linked by a cord
  Pisces: [
    "M7 4c-2.5 3-2.5 13 0 16",
    "M17 4c2.5 3 2.5 13 0 16",
    "M7 12h10",
  ],
};
