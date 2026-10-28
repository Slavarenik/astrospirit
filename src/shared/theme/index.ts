export * from "./colors";
export * from "./typography";
export * from "./spacing";

export const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export const ZODIAC_GLYPHS: Record<ZodiacSign, string> = {
  Aries: "♈",
  Taurus: "♉",
  Gemini: "♊",
  Cancer: "♋",
  Leo: "♌",
  Virgo: "♍",
  Libra: "♎",
  Scorpio: "♏",
  Sagittarius: "♐",
  Capricorn: "♑",
  Aquarius: "♒",
  Pisces: "♓",
};

export const ZODIAC_ELEMENT: Record<ZodiacSign, "Fire" | "Earth" | "Air" | "Water"> = {
  Aries: "Fire",
  Leo: "Fire",
  Sagittarius: "Fire",
  Taurus: "Earth",
  Virgo: "Earth",
  Capricorn: "Earth",
  Gemini: "Air",
  Libra: "Air",
  Aquarius: "Air",
  Cancer: "Water",
  Scorpio: "Water",
  Pisces: "Water",
};

/** Muted, gold-family element tones — kept in harmony with the single-metal
 *  palette rather than full neon hues, used only as small accent touches. */
export const ELEMENT_COLOR: Record<string, string> = {
  Fire: "#C97F56",
  Earth: "#8FA373",
  Air: "#A79BC9",
  Water: "#7FA3B3",
};

/** The ten bodies a full natal chart reads — Sun/Moon plus the eight
 *  classical+modern planets. Order is the traditional chart-reading order
 *  (luminaries first, then by distance from the Sun), used wherever these
 *  need a stable, consistent sequence (the full-chart wheel and list). */
export const PLANET_KEYS = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

export type PlanetKey = (typeof PLANET_KEYS)[number];

export const PLANET_GLYPHS: Record<PlanetKey, string> = {
  sun: "☉",
  moon: "☾",
  mercury: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
  uranus: "♅",
  neptune: "♆",
  pluto: "♇",
};
