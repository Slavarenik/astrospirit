import { useState } from "react";
import { pickRandomCards, TarotCard } from "../data/tarotCatalog";

export type SpreadSlotState = { card: TarotCard | null; reversed: boolean };

function emptySlots(count: number): SpreadSlotState[] {
  return Array.from({ length: count }, () => ({ card: null, reversed: false }));
}

/** Shared draw/reveal state for a fixed-size spread: a pre-shuffled pool of
 *  `count` distinct cards, one slot per position, filled in whatever order
 *  the person taps them, plus a reset for "New spread". The first two spread
 *  screens (3-card, Celtic Cross) predate this hook and keep the same logic
 *  written out inline — not worth the churn to retrofit — but every spread
 *  added since uses this instead of repeating it again. */
export function useSpreadDraw(count: number) {
  const [pool, setPool] = useState<TarotCard[]>(() => pickRandomCards(count));
  const [slots, setSlots] = useState<SpreadSlotState[]>(() => emptySlots(count));
  // Which slot is currently open in the full-screen viewer, if any — tapping
  // a face-up slot a second time opens it instead of doing nothing.
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const allRevealed = slots.every((s) => s.card !== null);

  const handlePick = (index: number) => {
    if (slots[index].card) return;
    const card = pool[index];
    const reversed = Math.random() < 0.25;
    setSlots((cur) => cur.map((s, i) => (i === index ? { card, reversed } : s)));
  };

  const handleSlotPress = (index: number) => {
    if (slots[index].card) {
      setViewerIndex(index);
    } else {
      handlePick(index);
    }
  };

  const handleNewSpread = () => {
    setPool(pickRandomCards(count));
    setSlots(emptySlots(count));
    setViewerIndex(null);
  };

  return {
    slots,
    allRevealed,
    handlePick,
    handleSlotPress,
    handleNewSpread,
    viewerIndex,
    closeViewer: () => setViewerIndex(null),
  };
}
