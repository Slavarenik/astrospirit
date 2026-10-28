import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { asyncStorageAdapter } from "./persist";

type DrawnCard = {
  dateKey: string; // yyyy-MM-dd
  cardId: string;
  reversed: boolean;
};

type CardOfDayState = {
  drawn: DrawnCard | null;
  setDrawn: (card: DrawnCard) => void;
  clear: () => void;
};

export const useCardOfDayStore = create<CardOfDayState>()(
  persist(
    (set) => ({
      drawn: null,
      setDrawn: (card) => set({ drawn: card }),
      clear: () => set({ drawn: null }),
    }),
    {
      name: "astrospirit/card-of-day",
      storage: createJSONStorage(() => asyncStorageAdapter),
    }
  )
);

export function todayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}
