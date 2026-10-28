import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { asyncStorageAdapter } from "./persist";

export type SpreadHistoryCard = {
  cardId: string;
  reversed: boolean;
  // Resolved at save time (e.g. "Past", "Итог", "Partner A — Thoughts") —
  // simpler than re-deriving it from a spread-type + position-key pair
  // later, at the cost of staying in whatever language it was saved in if
  // the person switches languages afterward. The card's own name and
  // meaning aren't stored this way — those are looked up fresh by cardId
  // and re-translated normally, same as every other result card.
  label: string;
};

export type SpreadHistoryEntry = {
  id: string;
  timestamp: number;
  spreadTitle: string; // resolved at save time, e.g. "Прошлое · Настоящее · Будущее"
  context?: string;
  cards: SpreadHistoryCard[];
};

type TarotHistoryState = {
  entries: SpreadHistoryEntry[];
  addEntry: (entry: SpreadHistoryEntry) => void;
  removeEntry: (id: string) => void;
  clear: () => void;
};

// A soft cap so this doesn't grow forever in AsyncStorage — oldest entries
// fall off once a person has done this many spreads.
const MAX_ENTRIES = 200;

/** Stage 3 of the tarot-spreads plan: past spreads, saved locally so
 *  Premium users can revisit a reading instead of only ever seeing today's.
 *  Newest first; every spread screen writes to this via
 *  useSpreadHistorySave once all of its positions are revealed. */
export const useTarotHistoryStore = create<TarotHistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) => set({ entries: [entry, ...get().entries].slice(0, MAX_ENTRIES) }),
      removeEntry: (id) => set({ entries: get().entries.filter((e) => e.id !== id) }),
      clear: () => set({ entries: [] }),
    }),
    {
      name: "astrospirit/tarot-history",
      storage: createJSONStorage(() => asyncStorageAdapter),
    }
  )
);
