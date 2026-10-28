/**
 * Astro Spirit palette v2 — flat, ornamental, antique-gold on charcoal-black.
 * Sampled directly from the "Zodiac Match" reference screens: a warm,
 * desaturated near-black background, a single antique-gold line/accent
 * color, and warm cream display text. No neon glow, no violet/teal
 * secondary accents — the whole app speaks in one metal.
 */
export const colors = {
  // Backgrounds — warm charcoal, not pure black
  bg0: "#15191A", // deepest background (splash, modals)
  bg1: "#1E2325", // screen background
  bg2: "#262B2D", // card / raised surface
  bg3: "#2F3537", // pressed / active surface
  bgElevated: "#242A2C",

  // Gold — the single accent, used for borders, icons, active states
  gold: "#C7A55E",
  goldLight: "#D9BE85",
  goldDeep: "#A9854A",
  goldSoft: "#C7A55E26", // low-opacity fill
  goldLine: "#C7A55E59", // hairline border opacity
  goldLineStrong: "#C7A55E99",

  // Aliases kept for drop-in compatibility with existing components
  accent: "#C7A55E",
  accentSoft: "#C7A55E26",
  accentStrong: "#D9BE85",
  accentGlow: "#E8D6A8",

  // Text
  textPrimary: "#F3ECDD",
  textSecondary: "#BDB6A6",
  textTertiary: "#857E6E",
  textOnAccent: "#1C1608",

  // Lines / borders
  hairline: "#FFFFFF14",
  hairlineStrong: "#FFFFFF28",
  goldLineHairline: "#C7A55E40",

  // Status (kept muted/gold-adjacent, no neon)
  success: "#9BBF8E",
  warning: "#D9BE85",
  danger: "#C98A6E",

  // Secondary motif colors — used sparingly for sun/moon/rising badges only
  violet: "#A79BC9",
  rose: "#C98FA3",
  teal: "#7FB3AE",

  gradients: {
    bg: ["#15191A", "#1E2325", "#15191A"],
    card: ["#262B2D", "#1E2325"],
    accent: ["#D9BE85", "#C7A55E", "#A9854A"],
    glow: ["#C7A55E40", "#C7A55E00"],
    night: ["#15191A", "#1B2022", "#232928"],
  },
} as const;

export type ThemeColors = typeof colors;
