import { useEffect, useRef } from "react";
import { useTarotHistoryStore } from "@shared/storage/useTarotHistoryStore";

type SlotLike = { card: { id: string } | null; reversed: boolean };

/** Saves a spread to history exactly once per completed reading. Fires when
 *  `allRevealed` flips to true, and re-arms when it goes back to false
 *  (i.e. "New spread" clears the slots) so the next completed spread saves
 *  again. One shared hook so every spread screen gets history for free —
 *  call it with the slots in position order and their already-localized
 *  labels (Past, Outcome, …) in the same order. */
export function useSpreadHistorySave(
  spreadTitle: string,
  slots: SlotLike[],
  labels: string[],
  allRevealed: boolean,
  context: string
) {
  const addEntry = useTarotHistoryStore((s) => s.addEntry);
  const savedRef = useRef(false);

  useEffect(() => {
    if (allRevealed && !savedRef.current) {
      savedRef.current = true;
      addEntry({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
        spreadTitle,
        context: context.trim() ? context.trim() : undefined,
        cards: slots.map((s, i) => ({
          cardId: s.card!.id,
          reversed: s.reversed,
          label: labels[i],
        })),
      });
    }
    if (!allRevealed) {
      savedRef.current = false;
    }
    // Deliberately keyed on allRevealed alone — it's the moment that
    // matters, and re-reading spreadTitle/context/labels via closure at
    // that instant is exactly what we want (not a dependency to re-fire on).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRevealed]);
}
