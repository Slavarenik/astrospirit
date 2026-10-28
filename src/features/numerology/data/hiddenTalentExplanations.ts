/** Hidden Talents — read from whichever digit(s) dominate the Pythagorean
 *  Square (see `getHiddenTalentDigits` in numerology.ts). Only 1-9: this
 *  reads a frequency count, not a reduced number, so master numbers don't
 *  apply here. */
export const HIDDEN_TALENT_EXPLANATION: Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, string> = {
  1: "A natural gift for leading — you instinctively take charge when no one else does.",
  2: "A natural gift for diplomacy — you sense what people need before they say it.",
  3: "A natural gift for creative expression — ideas turn into words, images, or performance easily.",
  4: "A natural gift for organizing — you turn chaos into a workable system almost automatically.",
  5: "A natural gift for adapting — you handle sudden change better than almost anyone around you.",
  6: "A natural gift for care-taking — people and situations stabilize around you.",
  7: "A natural gift for analysis — you get to the bottom of things others leave half-understood.",
  8: "A natural gift for managing resources — money, people, or projects scale well under you.",
  9: "A natural gift for empathy on a larger scale — you naturally think in terms of the whole group, not just yourself.",
};

/** Shown when no digit clears the "dominant" threshold — the person's
 *  digits are evenly spread rather than concentrated in one talent. */
export const HIDDEN_TALENT_BALANCED_NOTE =
  "No single digit dominates your birth date — your gifts are spread evenly rather than concentrated in one.";
