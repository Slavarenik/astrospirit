import { NumerologyValue } from "@shared/utils/numerology";

/** Consciousness Number — from the day of birth alone. Core instincts,
 *  ego, and the reflexive way a person moves through life. Written in the
 *  same spirit as SUN_EXPLANATION/MOON_EXPLANATION in signExplanations.ts. */
export const CONSCIOUSNESS_EXPLANATION: Record<NumerologyValue, string> = {
  1: "Your instinctive drive is leadership — you feel most like yourself when you're initiating, not following.",
  2: "Your instinctive drive is harmony — you feel most like yourself working alongside someone, not alone.",
  3: "Your instinctive drive is expression — you feel most like yourself when creating, speaking, or being seen.",
  4: "Your instinctive drive is structure — you feel most like yourself building something solid and lasting.",
  5: "Your instinctive drive is freedom — you feel most like yourself when change and movement are part of your days.",
  6: "Your instinctive drive is care — you feel most like yourself looking after people or a home you love.",
  7: "Your instinctive drive is depth — you feel most like yourself when given space to think, study, or withdraw.",
  8: "Your instinctive drive is mastery — you feel most like yourself building influence, skill, or results.",
  9: "Your instinctive drive is compassion — you feel most like yourself when your work serves something bigger than you.",
  11: "A master number — your instincts carry an amplified charge of the 2's sensitivity, tuned toward insight and inspiration rather than ordinary harmony.",
  22: "A master number — your instincts carry an amplified charge of the 4's structure, tuned toward building something of lasting, large-scale value.",
};

/** Mission Number — from every digit of the full birth date. The
 *  underlying purpose or lesson a person grows into over time, layered on
 *  top of the instinctive Consciousness Number above. */
export const MISSION_EXPLANATION: Record<NumerologyValue, string> = {
  1: "Your underlying mission is self-reliance — learning to stop waiting for permission and originate your own path.",
  2: "Your underlying mission is partnership — learning to find strength in cooperation rather than going it alone.",
  3: "Your underlying mission is authentic expression — letting your voice and creativity move through you without self-censorship.",
  4: "Your underlying mission is discipline — turning good intentions into steady, reliable follow-through.",
  5: "Your underlying mission is adaptability — meeting change with curiosity instead of resistance.",
  6: "Your underlying mission is responsibility — caring for others without losing yourself in the process.",
  7: "Your underlying mission is trust in your own inner knowing, beyond what can be proven or explained.",
  8: "Your underlying mission is a healthy relationship with power and reward — using them well, not fearing or chasing them.",
  9: "Your underlying mission is release — giving, forgiving, and letting experiences complete themselves.",
  11: "A master mission — turning heightened sensitivity into guidance others can actually use, rather than carrying it alone.",
  22: "A master mission — translating a big vision into something concrete that outlives you.",
};

/** Personal Year Number — birth day+month plus a given year, reduced.
 *  Conventionally single-digit only (1-9, no master numbers), and it
 *  changes every year rather than being fixed for life like the two above. */
export const PERSONAL_YEAR_EXPLANATION: Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, string> = {
  1: "This is a year of starting over — plant new seeds, don't just tend what's already growing.",
  2: "This is a year of patience and partnership — progress comes through cooperation, not force.",
  3: "This is a year for expression and social expansion — let yourself be seen and enjoy connection.",
  4: "This is a year for groundwork — discipline and routine pay off more than big leaps right now.",
  5: "This is a year of change — expect the unexpected and let go of what no longer fits.",
  6: "This is a year centered on home, family, and responsibility to the people close to you.",
  7: "This is a year for introspection — step back, study, and trust what you learn in the quiet.",
  8: "This is a year of results — effort from past years comes back as recognition, money, or both.",
  9: "This is a year of completion — close chapters, release what's finished, and make room for a new cycle.",
};
