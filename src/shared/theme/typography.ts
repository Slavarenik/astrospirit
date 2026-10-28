import { Platform } from "react-native";

/**
 * Typography scale v2 — editorial serif display with wide tracking
 * (matching the "ZODIAC MATCH" splash title), uppercase tracked labels,
 * clean sans for body copy. All display sizes widen their letter-spacing
 * slightly to read as engraved/ornamental rather than app-default.
 */
const serif = Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" });
const sans = Platform.select({ ios: "System", android: "sans-serif", default: "System" });

export const typography = {
  fontFamily: { serif, sans },
  display: { fontFamily: serif, fontSize: 36, lineHeight: 42, letterSpacing: 1.2 },
  h1: { fontFamily: serif, fontSize: 27, lineHeight: 33, letterSpacing: 0.6 },
  h2: { fontFamily: serif, fontSize: 21, lineHeight: 27, letterSpacing: 0.5 },
  h3: { fontFamily: serif, fontSize: 17, lineHeight: 23, letterSpacing: 0.4 },
  bodyLg: { fontFamily: sans, fontSize: 16, lineHeight: 24 },
  body: { fontFamily: sans, fontSize: 14, lineHeight: 21 },
  caption: { fontFamily: sans, fontSize: 12, lineHeight: 17 },
  micro: { fontFamily: sans, fontSize: 10.5, lineHeight: 14, letterSpacing: 0.8 },
  label: { fontFamily: sans, fontSize: 12, lineHeight: 16, letterSpacing: 2.2 },
} as const;
