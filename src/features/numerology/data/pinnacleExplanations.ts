import { NumerologyValue } from "@shared/utils/numerology";

/** Pinnacle Cycles ("life stages") — one entry per reduced number, framed
 *  as a period rather than a fixed trait, since the same number means
 *  something slightly different when it's describing a stretch of years
 *  instead of a permanent core number. See `getPinnacleCycles` in
 *  numerology.ts for how the four periods and their age ranges are derived. */
export const PINNACLE_EXPLANATION: Record<NumerologyValue, string> = {
  1: "A cycle about independence — a push to stand on your own and initiate rather than follow.",
  2: "A cycle about partnership — growth comes through cooperation, patience, and other people.",
  3: "A cycle about expression — a stretch for creativity, visibility, and social connection.",
  4: "A cycle about building — slow, steady effort toward something structurally solid.",
  5: "A cycle about change — travel, movement, or circumstances in flux more than usual.",
  6: "A cycle about responsibility — family, home, or care for others takes center stage.",
  7: "A cycle about introspection — a pull toward study, solitude, and inner work.",
  8: "A cycle about achievement — material results and recognition become more reachable.",
  9: "A cycle about completion — closing a chapter and preparing to give rather than acquire.",
  11: "A master cycle — heightened sensitivity and a real chance to inspire or guide others.",
  22: "A master cycle — the chance to build something of real, lasting scale.",
};
