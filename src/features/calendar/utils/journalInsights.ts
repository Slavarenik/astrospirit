import { JournalEntry } from "@shared/storage/useIntentionsStore";

export type MoodKey = "low" | "neutral" | "good" | "great";

const MOOD_VALUE: Record<MoodKey, number> = { low: 1, neutral: 2, good: 3, great: 4 };
export const MOOD_KEYS: MoodKey[] = ["low", "neutral", "good", "great"];

/** Minimum number of entries in the window before we bother drawing a
 *  trend line — below this, a sparkline is more noise than signal. */
export const MIN_ENTRIES_FOR_TREND = 3;

/** A mood-average gap (on the 1..4 scale) smaller than this reads as
 *  "about the same" rather than a real difference — keeps single noisy
 *  days from flipping the pattern text back and forth. */
const DIFF_THRESHOLD = 0.4;

/** Weekday/weekend needs at least this many entries on EACH side before
 *  we'll call it a pattern — one lonely Saturday entry isn't a trend. */
const MIN_PER_SIDE_WEEKDAY_WEEKEND = 2;

/** Week-over-week only needs one entry per side — weeks are naturally
 *  sparse, so requiring more would silence it most of the time. */
const MIN_PER_SIDE_WEEK = 1;

export type Trend = "up" | "down" | "flat" | "insufficient";
export type WeekdayWeekendPattern = "weekendBrighter" | "weekdayBrighter" | "similar" | "insufficient";

export type JournalInsights = {
  /** Entries inside the window, oldest first (chronological — the order a
   *  sparkline / trend reads naturally). */
  entries: JournalEntry[];
  moodCounts: Record<MoodKey, number>;
  mostFrequentMood: MoodKey | null;
  /** One numeric value per entry, same order as `entries`, mapped
   *  low=1..great=4, ready to hand to a sparkline. */
  sparklineValues: number[];
  totalEntries: number;

  /** Rule-based "weekends vs weekdays" read — no AI involved, just an
   *  average-mood comparison with a minimum-sample guard. */
  weekdayWeekendPattern: WeekdayWeekendPattern;
  weekdayAvg: number | null;
  weekendAvg: number | null;

  /** Rule-based "this week vs last week" read, same approach. */
  weekOverWeekTrend: Trend;
  thisWeekAvg: number | null;
  lastWeekAvg: number | null;
};

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function dayOfWeek(dateKey: string): number {
  // dateKey is "YYYY-MM-DD"; anchoring at local midnight avoids UTC
  // boundary slips shifting a date to the wrong day of week.
  return new Date(`${dateKey}T00:00:00`).getDay();
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Builds the monthly mood pattern from a journal list: filters to the
 *  trailing `windowDays` (default 30, by dateKey string compare — dateKey
 *  is "YYYY-MM-DD" so lexicographic order is chronological order), finds
 *  the most-frequent mood, produces a chronological value series for a
 *  trend sparkline, and derives two simple rule-based observations —
 *  weekday-vs-weekend and this-week-vs-last-week — with no AI involved.
 *  `now` is injectable for predictable testing. */
export function computeJournalInsights(
  journal: JournalEntry[],
  windowDays: number = 30,
  now: Date = new Date()
): JournalInsights {
  const todayKey = toDateKey(now);
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - windowDays);
  const cutoffKey = toDateKey(cutoff);

  const inWindow = journal.filter((e) => e.dateKey >= cutoffKey && e.dateKey <= todayKey);

  const entries = [...inWindow].sort((a, b) => {
    if (a.dateKey !== b.dateKey) return a.dateKey < b.dateKey ? -1 : 1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });

  const moodCounts: Record<MoodKey, number> = { low: 0, neutral: 0, good: 0, great: 0 };
  for (const e of entries) moodCounts[e.mood] += 1;

  let mostFrequentMood: MoodKey | null = null;
  let best = 0;
  for (const key of MOOD_KEYS) {
    if (moodCounts[key] > best) {
      best = moodCounts[key];
      mostFrequentMood = key;
    }
  }

  // Weekday vs weekend.
  const weekdayValues: number[] = [];
  const weekendValues: number[] = [];
  for (const e of entries) {
    const dow = dayOfWeek(e.dateKey);
    const value = MOOD_VALUE[e.mood];
    if (dow === 0 || dow === 6) weekendValues.push(value);
    else weekdayValues.push(value);
  }
  const weekdayAvg = average(weekdayValues);
  const weekendAvg = average(weekendValues);

  let weekdayWeekendPattern: WeekdayWeekendPattern = "insufficient";
  if (
    weekdayValues.length >= MIN_PER_SIDE_WEEKDAY_WEEKEND &&
    weekendValues.length >= MIN_PER_SIDE_WEEKDAY_WEEKEND &&
    weekdayAvg !== null &&
    weekendAvg !== null
  ) {
    const diff = weekendAvg - weekdayAvg;
    weekdayWeekendPattern = diff >= DIFF_THRESHOLD ? "weekendBrighter" : diff <= -DIFF_THRESHOLD ? "weekdayBrighter" : "similar";
  }

  // This week vs last week (rolling 7-day buckets anchored on `now`).
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(thisWeekStart.getDate() - 6);
  const thisWeekStartKey = toDateKey(thisWeekStart);

  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(lastWeekStart.getDate() - 13);
  const lastWeekStartKey = toDateKey(lastWeekStart);
  const lastWeekEnd = new Date(now);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
  const lastWeekEndKey = toDateKey(lastWeekEnd);

  const thisWeekValues: number[] = [];
  const lastWeekValues: number[] = [];
  for (const e of entries) {
    const value = MOOD_VALUE[e.mood];
    if (e.dateKey >= thisWeekStartKey && e.dateKey <= todayKey) {
      thisWeekValues.push(value);
    } else if (e.dateKey >= lastWeekStartKey && e.dateKey <= lastWeekEndKey) {
      lastWeekValues.push(value);
    }
  }
  const thisWeekAvg = average(thisWeekValues);
  const lastWeekAvg = average(lastWeekValues);

  let weekOverWeekTrend: Trend = "insufficient";
  if (
    thisWeekValues.length >= MIN_PER_SIDE_WEEK &&
    lastWeekValues.length >= MIN_PER_SIDE_WEEK &&
    thisWeekAvg !== null &&
    lastWeekAvg !== null
  ) {
    const diff = thisWeekAvg - lastWeekAvg;
    weekOverWeekTrend = diff >= DIFF_THRESHOLD ? "up" : diff <= -DIFF_THRESHOLD ? "down" : "flat";
  }

  return {
    entries,
    moodCounts,
    mostFrequentMood,
    sparklineValues: entries.map((e) => MOOD_VALUE[e.mood]),
    totalEntries: entries.length,
    weekdayWeekendPattern,
    weekdayAvg,
    weekendAvg,
    weekOverWeekTrend,
    thisWeekAvg,
    lastWeekAvg,
  };
}
