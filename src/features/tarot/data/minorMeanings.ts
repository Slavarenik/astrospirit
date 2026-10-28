import { CardMeaning } from "./majorMeanings";

type SuitInfo = { theme: string; domain: string; shadow: string };

const SUIT_INFO: Record<string, SuitInfo> = {
  Cups: { theme: "emotion and connection", domain: "your relationships and inner life", shadow: "emotional avoidance or overwhelm" },
  Wands: { theme: "passion and drive", domain: "your ambitions and creative fire", shadow: "burnout or impulsiveness" },
  Swords: { theme: "thought and truth", domain: "your mind and the stories you tell yourself", shadow: "overthinking or conflict" },
  Pentacles: { theme: "resources and the body", domain: "your work, money, and physical world", shadow: "scarcity thinking or rigidity" },
};

type RankInfo = { upright: string; keyword: string };

const RANK_INFO: Record<string, RankInfo> = {
  Ace: { upright: "A pure, new opportunity is offered — raw potential in", keyword: "new potential" },
  Two: { upright: "A choice or partnership is forming around", keyword: "balance" },
  Three: { upright: "The first real growth and collaboration appears in", keyword: "growth" },
  Four: { upright: "A pause for stability and reflection is needed around", keyword: "stability" },
  Five: { upright: "Conflict or loss tests your footing in", keyword: "challenge" },
  Six: { upright: "Harmony and a return to ease arrive in", keyword: "harmony" },
  Seven: { upright: "A moment to reassess your strategy around", keyword: "reflection" },
  Eight: { upright: "Movement and mastery are building in", keyword: "momentum" },
  Nine: { upright: "You're close to resolution — near-mastery of", keyword: "near-completion" },
  Ten: { upright: "Completion, for better or worse, arrives in", keyword: "culmination" },
  Page: { upright: "A curious, beginner's-mind energy opens up around", keyword: "curiosity" },
  Knight: { upright: "Bold, focused action is called for in", keyword: "pursuit" },
  Queen: { upright: "Intuitive mastery and nurturing wisdom guide", keyword: "mastery" },
  King: { upright: "Confident, grounded command is available to you in", keyword: "command" },
};

export function getMinorMeaning(name: string, suit: string, rank: string): CardMeaning {
  const suitInfo = SUIT_INFO[suit];
  const rankInfo = RANK_INFO[rank];
  const upright = `${rankInfo.upright} ${suitInfo.theme} — pay attention to ${suitInfo.domain}.`;
  const reversed = `The shadow side shows up as ${suitInfo.shadow}, often around ${suitInfo.domain}.`;
  const psychological = `${name} points to ${rankInfo.keyword} in the realm of ${suitInfo.theme}. Notice how this theme is already quietly present in your day, and let the card name what you already half-knew.`;
  return {
    keywords: [rankInfo.keyword, suitInfo.theme],
    upright,
    reversed,
    psychological,
  };
}
