/** Karmic Lesson Numbers — digits 1-9 that never appear among the
 *  Pythagorean letter values of a person's name (see
 *  `getKarmicLessonNumbers` in numerology.ts). Framed as an area that
 *  hasn't had practice yet rather than a flaw. */
export const KARMIC_LESSON_EXPLANATION: Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, string> = {
  1: "A karmic lesson around independence — learning to act without waiting for someone else to go first.",
  2: "A karmic lesson around cooperation — learning patience with other people's pace.",
  3: "A karmic lesson around self-expression — learning to say what you actually mean, out loud.",
  4: "A karmic lesson around discipline — learning to finish what structure and routine demand.",
  5: "A karmic lesson around freedom — learning to handle change without losing your footing.",
  6: "A karmic lesson around responsibility — learning to show up for commitments to other people.",
  7: "A karmic lesson around trust — learning to rely on your own judgment without outside proof.",
  8: "A karmic lesson around power and money — learning a healthy, non-anxious relationship with both.",
  9: "A karmic lesson around generosity — learning to give without keeping score.",
};

/** Shown when every digit 1-9 appears at least once in the name — no
 *  strong karmic-lesson signal from the letters alone. */
export const KARMIC_LESSON_NONE_NOTE =
  "No digit is missing from your name's letters — no strong karmic-lesson signal from this method alone.";
