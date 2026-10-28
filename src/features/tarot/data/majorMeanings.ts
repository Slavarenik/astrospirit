export type CardMeaning = {
  keywords: string[];
  upright: string;
  reversed: string;
  psychological: string;
};

export const MAJOR_MEANINGS: Record<string, CardMeaning> = {
  "The Fool": {
    keywords: ["beginnings", "faith", "leap"],
    upright: "A fresh start calls. Step forward without needing every answer first.",
    reversed: "Hesitation or recklessness — check which fear is really steering you.",
    psychological:
      "The Fool asks what you'd attempt if you trusted yourself the way you did before you learned to doubt. Today, notice where caution has quietly become avoidance.",
  },
  "The Magician": {
    keywords: ["willpower", "resourcefulness", "action"],
    upright: "You already have every tool you need. Focus turns intention into result.",
    reversed: "Scattered energy or manipulation — align what you say with what you do.",
    psychological:
      "This card mirrors your own agency back to you. The question isn't whether you're capable — it's where you're pointing that capability.",
  },
  "The High Priestess": {
    keywords: ["intuition", "mystery", "stillness"],
    upright: "The answer isn't ready to be spoken yet. Sit with what you sense.",
    reversed: "You're drowning out your own knowing with noise or other people's opinions.",
    psychological:
      "A quieter, older intelligence in you is trying to be heard beneath logic. Protect ten minutes of silence today and let it speak.",
  },
  "The Empress": {
    keywords: ["abundance", "nurture", "creativity"],
    upright: "Growth comes from tending, not forcing. Let something ripen at its own pace.",
    reversed: "Over-giving has left you depleted — nurture yourself before anyone else.",
    psychological:
      "You create safety for things to grow — including yourself. Ask where you've forgotten to extend that same care inward.",
  },
  "The Emperor": {
    keywords: ["structure", "authority", "discipline"],
    upright: "A clear structure now will save you from chaos later. Set the boundary.",
    reversed: "Rigidity or control is working against you — loosen the grip slightly.",
    psychological:
      "Security here comes from order you build yourself, not from someone else's rules. Where could one clear decision end a lingering uncertainty?",
  },
  "The Hierophant": {
    keywords: ["tradition", "guidance", "belief"],
    upright: "Wisdom from a mentor, tradition, or structure serves you well today.",
    reversed: "A belief you inherited may no longer fit who you're becoming.",
    psychological:
      "Notice which rules you're following because they're true for you, versus which ones you never actually chose.",
  },
  "The Lovers": {
    keywords: ["connection", "choice", "alignment"],
    upright: "A real choice is in front of you — one that asks you to be honest about values.",
    reversed: "Misalignment or a difficult choice you've been avoiding needs attention.",
    psychological:
      "This is less about romance and more about integration — do your head and heart currently agree?",
  },
  "The Chariot": {
    keywords: ["willpower", "drive", "direction"],
    upright: "Two opposing forces can be harnessed together if you hold the reins steady.",
    reversed: "Direction has been lost — pause before pushing forward blindly.",
    psychological:
      "Victory today comes from inner alignment more than outer force. What two parts of you need to agree on a direction?",
  },
  Strength: {
    keywords: ["courage", "patience", "compassion"],
    upright: "Gentle, persistent courage moves mountains that force cannot.",
    reversed: "Self-doubt or forcing an issue — try softness instead of control.",
    psychological:
      "Real strength today looks like staying kind to yourself while still holding your ground.",
  },
  "The Hermit": {
    keywords: ["introspection", "solitude", "guidance"],
    upright: "Withdraw briefly. The answer you need is found alone, not in company.",
    reversed: "Isolation has tipped into loneliness — it may be time to reach out.",
    psychological:
      "Your own inner light is enough to navigate by right now, even without full clarity ahead.",
  },
  "Wheel of Fortune": {
    keywords: ["change", "cycles", "fate"],
    upright: "A shift is in motion. Flow with the turn rather than resisting it.",
    reversed: "Resisting change only prolongs the discomfort — let the cycle move.",
    psychological:
      "What feels chaotic may simply be a cycle turning on schedule. Where can you trust timing instead of forcing an outcome?",
  },
  Justice: {
    keywords: ["truth", "balance", "accountability"],
    upright: "Clear-eyed honesty — with yourself especially — restores balance.",
    reversed: "An imbalance or avoided truth is asking to be acknowledged.",
    psychological:
      "This card invites an honest accounting, not judgment. What would fairness to yourself look like today?",
  },
  "The Hanged Man": {
    keywords: ["pause", "surrender", "perspective"],
    upright: "Nothing to do right now but see things from a new angle. Pause with intention.",
    reversed: "Needless delay or martyrdom — ask if the sacrifice is actually necessary.",
    psychological:
      "Suspension isn't failure. A deliberate pause can be the most productive thing you do today.",
  },
  Death: {
    keywords: ["transformation", "endings", "release"],
    upright: "Something is complete. Let the ending happen so the next thing can begin.",
    reversed: "Clinging to what's already over is causing more pain than the letting go would.",
    psychological:
      "This card rarely means literal loss — it means a version of you is ready to be retired. What identity are you still performing out of habit?",
  },
  Temperance: {
    keywords: ["balance", "patience", "integration"],
    upright: "Slow, patient blending — of ideas, people, or parts of yourself — brings harmony.",
    reversed: "Extremes or impatience are throwing things out of balance.",
    psychological:
      "Moderation today isn't about restriction — it's about finding the exact right measure of each thing.",
  },
  "The Devil": {
    keywords: ["attachment", "shadow", "temptation"],
    upright: "Name the thing you feel chained to. Naming it is the first step to choosing differently.",
    reversed: "A release or breakthrough from an old pattern is within reach.",
    psychological:
      "Nothing here binds you except the belief that you can't leave. What would it mean to admit the chain was never locked?",
  },
  "The Tower": {
    keywords: ["upheaval", "revelation", "truth"],
    upright: "A sudden, clarifying shake-up. What falls away wasn't built to last anyway.",
    reversed: "Fear of collapse is causing you to avoid a necessary change.",
    psychological:
      "Disruption can be the fastest route to truth. What structure in your life was already unstable before today?",
  },
  "The Star": {
    keywords: ["hope", "healing", "renewal"],
    upright: "After difficulty, a quiet hope returns. Trust that you're being replenished.",
    reversed: "Disconnection from hope — reconnect with something that restores you.",
    psychological:
      "This is a card of gentle faith, not naive optimism. What small evidence of healing can you notice today?",
  },
  "The Moon": {
    keywords: ["uncertainty", "subconscious", "intuition"],
    upright: "Not everything is clear yet, and that's alright. Let intuition lead through the fog.",
    reversed: "Anxiety or illusion is distorting what's actually in front of you.",
    psychological:
      "Confusion here is information, not failure — it means something true is still forming beneath the surface.",
  },
  "The Sun": {
    keywords: ["joy", "vitality", "clarity"],
    upright: "Warmth, clarity, and genuine joy are available to you today — let them in.",
    reversed: "Clouded optimism — look for the smaller, quieter joys instead of forcing cheer.",
    psychological:
      "This is permission to feel good without needing to justify it. What would you do today purely because it delights you?",
  },
  Judgement: {
    keywords: ["reckoning", "awakening", "calling"],
    upright: "A moment of clarity about who you've become — and who you're ready to be.",
    reversed: "Self-judgment is louder than the truth — try compassion instead of a verdict.",
    psychological:
      "This card asks for an honest reckoning, not punishment. What would it feel like to forgive the version of you that didn't know better yet?",
  },
  "The World": {
    keywords: ["completion", "wholeness", "arrival"],
    upright: "A cycle completes. Take a moment to actually feel the arrival before starting the next one.",
    reversed: "Something feels unfinished — identify the one loose thread that needs closing.",
    psychological:
      "Completion is its own kind of rest. What have you finished that you haven't yet let yourself celebrate?",
  },
};
