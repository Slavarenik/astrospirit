import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { asyncStorageAdapter } from "./persist";

export type TrackerId = string;

export type JournalEntry = {
  id: string;
  dateKey: string;
  text: string;
  mood: "low" | "neutral" | "good" | "great";
  sentiment: {
    summary: string;
    triggers: string[];
    suggestion: string;
  };
};

type IntentionsState = {
  // trackers: dateKey -> set of completed tracker ids
  trackerLog: Record<string, TrackerId[]>;
  toggleTracker: (dateKey: string, tracker: TrackerId) => void;
  isTrackerDone: (dateKey: string, tracker: TrackerId) => boolean;

  journal: JournalEntry[];
  addJournalEntry: (entry: JournalEntry) => void;

  streakDays: () => number;
};

/** A large rotating pool of daily ritual/mindfulness tasks — a different
 *  subset of TRACKERS_PER_DAY is drawn from here each day (see
 *  getTodayTrackers below) so the checklist doesn't go stale. Icons are
 *  Feather-style keyword hints consumed by TrackerRow's icon map. */
export const TRACKER_POOL: { id: TrackerId; label: string; icon: string }[] = [
  { id: "water", label: "Drink your daily water quota", icon: "droplet" },
  { id: "silence", label: "10 minutes of silence", icon: "wind" },
  { id: "gratitude", label: "Thank 3 people", icon: "heart" },
  { id: "nature", label: "Spend time alone in nature", icon: "leaf" },
  { id: "stress", label: "Log your stress level", icon: "pulse" },
  { id: "meditate", label: "Meditate for 5 minutes", icon: "circle" },
  { id: "sunlight", label: "Get 10 minutes of sunlight", icon: "sun" },
  { id: "journal", label: "Write 3 lines in your journal", icon: "feather" },
  { id: "breathwork", label: "Do a box-breathing cycle", icon: "wind" },
  { id: "digital-detox", label: "1 hour away from your phone", icon: "moon" },
  { id: "stretch", label: "Stretch for 5 minutes", icon: "activity" },
  { id: "affirmation", label: "Say today's affirmation aloud", icon: "message-circle" },
  { id: "moon-gaze", label: "Look up at the moon tonight", icon: "moon" },
  { id: "declutter", label: "Clear one small space", icon: "grid" },
  { id: "kindness", label: "Do one random act of kindness", icon: "heart" },
  { id: "early-rise", label: "Rise before your alarm", icon: "sun" },
  { id: "no-complaints", label: "Go an hour without complaining", icon: "smile" },
  { id: "tea-ritual", label: "Drink tea slowly, no distractions", icon: "coffee" },
  { id: "walk", label: "Take a mindful 10-minute walk", icon: "map" },
  { id: "tarot-pull", label: "Reflect on your card of the day", icon: "layers" },
  { id: "intention", label: "Set one intention for tomorrow", icon: "compass" },
  { id: "forgive", label: "Release one small grudge", icon: "wind" },
  { id: "stargaze", label: "Spend a minute under the stars", icon: "star" },
  { id: "music", label: "Listen to one song, fully present", icon: "music" },
  { id: "cold-water", label: "End your shower with 10s cold", icon: "droplet" },
  { id: "unplug-meal", label: "Eat one meal screen-free", icon: "circle" },
  { id: "body-scan", label: "Do a 3-minute body scan", icon: "activity" },
  { id: "letter", label: "Write a note to your future self", icon: "feather" },
  { id: "declutter-mind", label: "Brain-dump your to-dos on paper", icon: "grid" },
  { id: "compliment", label: "Give a genuine compliment", icon: "heart" },
  { id: "no-scroll-am", label: "No phone in the first 20 minutes", icon: "moon" },
  { id: "candle", label: "Light a candle and sit with it", icon: "sun" },
  { id: "stretch-am", label: "Stretch before you check your phone", icon: "activity" },
  { id: "breath-4-7-8", label: "Try a 4-7-8 breathing round", icon: "wind" },
  { id: "gratitude-3", label: "Name 3 things going right", icon: "heart" },
  { id: "silence-meal", label: "Eat in silence for 5 minutes", icon: "circle" },
  { id: "tidy-space", label: "Tidy your sleeping space", icon: "grid" },
  { id: "reach-out", label: "Check in on someone you miss", icon: "message-circle" },
  { id: "slow-morning", label: "Take 5 extra minutes before rushing", icon: "sun" },
  { id: "unclench", label: "Notice and release jaw/shoulder tension", icon: "activity" },
  { id: "moon-journal", label: "Journal by the current moon phase", icon: "moon" },
  { id: "no-caffeine-pm", label: "Skip caffeine after midday", icon: "coffee" },
  { id: "tech-sunset", label: "Screens off 30 minutes before bed", icon: "moon" },
  { id: "name-emotion", label: "Name an emotion before reacting to it", icon: "pulse" },
  { id: "stretch-pm", label: "Stretch before bed", icon: "activity" },
  { id: "water-plant", label: "Tend to a plant or living thing", icon: "leaf" },
  { id: "deep-breath", label: "Take 5 slow, deep breaths", icon: "wind" },
  { id: "sky-watch", label: "Watch the sunrise or sunset", icon: "sun" },
  { id: "self-compassion", label: "Speak to yourself like a friend would", icon: "heart" },
  { id: "silence-walk", label: "Walk without headphones", icon: "map" },
  { id: "review-day", label: "Reflect on one win from today", icon: "star" },
  { id: "hydrate-am", label: "Drink water before your first coffee", icon: "droplet" },
  { id: "no-judgment", label: "Catch yourself judging, let it go", icon: "wind" },
];

export const TRACKERS_PER_DAY = 5;

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministically picks a different TRACKERS_PER_DAY-sized slice of
 *  TRACKER_POOL for a given dateKey, so the checklist rotates daily without
 *  needing network calls or server state — same date always yields the
 *  same picks (stable across re-renders / app restarts). */
export function getTodayTrackers(dateKey: string, count: number = TRACKERS_PER_DAY) {
  const rand = mulberry32(hashString(dateKey));
  const pool = [...TRACKER_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export const useIntentionsStore = create<IntentionsState>()(
  persist(
    (set, get) => ({
      trackerLog: {},
      toggleTracker: (dateKey, tracker) => {
        const log = { ...get().trackerLog };
        const list = new Set(log[dateKey] ?? []);
        if (list.has(tracker)) list.delete(tracker);
        else list.add(tracker);
        log[dateKey] = Array.from(list);
        set({ trackerLog: log });
      },
      isTrackerDone: (dateKey, tracker) => {
        return (get().trackerLog[dateKey] ?? []).includes(tracker);
      },
      journal: [],
      addJournalEntry: (entry) => set({ journal: [entry, ...get().journal] }),
      streakDays: () => {
        const log = get().trackerLog;
        let streak = 0;
        const d = new Date();
        for (let i = 0; i < 60; i++) {
          const key = d.toISOString().slice(0, 10);
          if ((log[key] ?? []).length > 0) {
            streak += 1;
            d.setDate(d.getDate() - 1);
          } else break;
        }
        return streak;
      },
    }),
    {
      name: "astrospirit/intentions",
      storage: createJSONStorage(() => asyncStorageAdapter),
    }
  )
);
