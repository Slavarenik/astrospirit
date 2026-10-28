import manifest from "./tarot-manifest.json";
import { MAJOR_MEANINGS, CardMeaning } from "./majorMeanings";
import { getMinorMeaning } from "./minorMeanings";

export type TarotCard = {
  id: string; // slug
  name: string;
  file: string;
  arcana: "major" | "minor";
  suit: string | null;
  rank?: string;
  meaning: CardMeaning;
};

type ManifestEntry = {
  name: string;
  file: string;
  arcana: "major" | "minor";
  suit: string | null;
  rank?: string;
};

function buildCard(entry: ManifestEntry): TarotCard {
  const id = entry.file.replace(/\.png$/, "");
  const meaning =
    entry.arcana === "major"
      ? MAJOR_MEANINGS[entry.name] ?? {
          keywords: ["mystery"],
          upright: "A powerful shift is present — stay open to its message.",
          reversed: "This energy is blocked or turned inward right now.",
          psychological: "Sit with this card a moment longer; its meaning will surface.",
        }
      : getMinorMeaning(entry.name, entry.suit ?? "Cups", entry.rank ?? "Ace");

  return {
    id,
    name: entry.name,
    file: entry.file,
    arcana: entry.arcana,
    suit: entry.suit,
    rank: entry.rank,
    meaning,
  };
}

export const MAJOR_CARDS: TarotCard[] = (manifest.major as ManifestEntry[]).map(buildCard);
export const MINOR_CARDS: TarotCard[] = (manifest.minor as ManifestEntry[]).map(buildCard);
export const ALL_CARDS: TarotCard[] = [...MAJOR_CARDS, ...MINOR_CARDS];

export function getCardById(id: string): TarotCard | undefined {
  return ALL_CARDS.find((c) => c.id === id);
}

/** Deterministic "random" pick seeded by a string (e.g. today's date) so the
 *  card of the day stays stable across re-renders within the same day. */
export function pickDeterministicCard(seed: string, pool: TarotCard[] = ALL_CARDS): TarotCard {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return pool[h % pool.length];
}

export function pickRandomCard(pool: TarotCard[] = ALL_CARDS): TarotCard {
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Draws `n` distinct random cards — for multi-card spreads, where the same
 *  card shouldn't appear twice in one reading. */
export function pickRandomCards(n: number, pool: TarotCard[] = ALL_CARDS): TarotCard[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
