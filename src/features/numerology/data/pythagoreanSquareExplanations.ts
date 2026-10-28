import { PythagoreanTraitKey } from "@shared/utils/numerology";

/** One short sentence per trait per level (low/balanced/strong — see
 *  `pythagoreanTraitLevel()` in numerology.ts for the count→level mapping).
 *  Dynamic/generated content, localized at render like the rest of the
 *  explanation tables in this feature — trait *titles* are short UI chrome
 *  and live in translations.ts instead (`numerology.square.traits.*`). */
export const PYTHAGOREAN_TRAIT_EXPLANATION: Record<PythagoreanTraitKey, Record<"low" | "balanced" | "strong", string>> = {
  character: {
    low: "A gap here — willpower and character may need deliberate practice rather than coming naturally.",
    balanced: "A steady, workable measure of willpower and character.",
    strong: "A dominant trait — strong-willed, sometimes stubborn, with real staying power.",
  },
  energy: {
    low: "Energy runs lower — pacing and rest matter more for you than pushing through.",
    balanced: "A workable, steady level of energy and drive.",
    strong: "High energy — a strong engine, prone to restlessness if it isn't put to use.",
  },
  duty: {
    low: "Obligation doesn't come naturally — you do best when a commitment is also a genuine interest.",
    balanced: "A reasonable sense of responsibility toward your commitments.",
    strong: "A strong pull toward duty and responsibility, sometimes at your own expense.",
  },
  health: {
    low: "Worth paying closer attention to physical upkeep — it won't take care of itself automatically.",
    balanced: "A generally steady constitution.",
    strong: "A resilient constitution — physical stamina is one of your real strengths.",
  },
  logic: {
    low: "Decisions may lean more on instinct than analysis — worth slowing down for the numbers sometimes.",
    balanced: "A workable balance of logic and intuition.",
    strong: "Strong analytical wiring — you reason your way to conclusions more than feel your way there.",
  },
  labor: {
    low: "Sustained, repetitive effort is harder to keep up — short bursts suit you better than marathons.",
    balanced: "A steady, reliable capacity for work.",
    strong: "A strong capacity for sustained effort — built for the long haul.",
  },
  selfEsteem: {
    low: "Self-belief may need outside reinforcement before it's fully internalized.",
    balanced: "A reasonably steady sense of self-worth.",
    strong: "Strong self-belief — confidence that holds up even under pressure.",
  },
  family: {
    low: "Domestic routine and home life may feel like something to manage rather than something that recharges you.",
    balanced: "A workable connection to home and family life.",
    strong: "Home and family are a real source of stability and energy for you.",
  },
};
