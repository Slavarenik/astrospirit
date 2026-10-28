/**
 * Lightweight on-device heuristic that stands in for the "Text AI" journal
 * analysis described in the product spec (GPT-4o-mini / Claude Haiku in
 * production). Swap `analyzeJournalEntry` for a real API call once a text-AI
 * key is wired up — the call site (useIntentionsStore / EveningJournal
 * screen) doesn't need to change shape.
 */

const NEGATIVE_WORDS = [
  "anxious", "anxiety", "stressed", "stress", "tired", "exhausted", "sad",
  "angry", "frustrated", "worried", "overwhelmed", "lonely", "afraid",
  "scared", "upset", "hurt", "failed", "failure", "hate", "cry", "crying",
];
const POSITIVE_WORDS = [
  "happy", "grateful", "joy", "excited", "calm", "peaceful", "proud",
  "love", "loved", "hopeful", "relieved", "content", "accomplished",
  "good", "great", "amazing", "wonderful", "energized",
];
const TRIGGER_MAP: { key: string; words: string[] }[] = [
  { key: "Work pressure", words: ["work", "job", "deadline", "boss", "meeting", "project"] },
  { key: "Relationship tension", words: ["partner", "boyfriend", "girlfriend", "husband", "wife", "argument", "fight", "relationship"] },
  { key: "Money worries", words: ["money", "bills", "rent", "debt", "budget", "afford"] },
  { key: "Sleep & energy", words: ["sleep", "tired", "insomnia", "exhausted", "awake"] },
  { key: "Family", words: ["mom", "dad", "mother", "father", "family", "parents", "sister", "brother"] },
  { key: "Self-doubt", words: ["enough", "failure", "doubt", "worthless", "not good"] },
];

export type SentimentResult = {
  mood: "low" | "neutral" | "good" | "great";
  summary: string;
  triggers: string[];
  suggestion: string;
};

export function analyzeJournalEntry(text: string): SentimentResult {
  const lower = text.toLowerCase();
  const countMatches = (words: string[]) =>
    words.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0);

  const negScore = countMatches(NEGATIVE_WORDS);
  const posScore = countMatches(POSITIVE_WORDS);
  const score = posScore - negScore;

  let mood: SentimentResult["mood"] = "neutral";
  if (score <= -2) mood = "low";
  else if (score < 1) mood = "neutral";
  else if (score < 3) mood = "good";
  else mood = "great";

  const triggers = TRIGGER_MAP.filter((t) => countMatches(t.words) > 0).map((t) => t.key);

  const summaries: Record<SentimentResult["mood"], string> = {
    low: "Today carried real weight. There's tension sitting underneath the surface that deserves gentleness, not pressure to fix it tonight.",
    neutral: "A mixed, ordinary day — some friction, some ease. Nothing demands urgent attention, but a few threads are worth a second look.",
    good: "Overall a steady, positive day. You're moving with more ease than resistance right now.",
    great: "A genuinely bright day — worth noting what made it feel this good, so you can return to it on harder days.",
  };

  const suggestions: Record<SentimentResult["mood"], string> = {
    low: "Try a 5-minute breathing reset before bed, and name one small, kind thing you'll do for yourself tomorrow morning.",
    neutral: "A short evening walk or ten quiet minutes could help settle today before sleep.",
    good: "Carry this momentum forward — a quick gratitude note for what worked today will reinforce it.",
    great: "Let yourself fully feel this one, without immediately planning the next thing.",
  };

  return {
    mood,
    summary: summaries[mood],
    triggers: triggers.length ? triggers : ["No strong pattern detected"],
    suggestion: suggestions[mood],
  };
}
