import { ZodiacSign } from "@shared/theme";

/**
 * Stand-ins for the "Text AI" generation calls described in the spec
 * (daily affirmation, meditation script). Deterministic per day/sign so the
 * UI feels stable, but trivially swappable for a real GPT-4o-mini / Claude
 * Haiku call later — just replace the body, keep the signature.
 */

/** 100 affirmations — getAffirmationOfDay picks one deterministically per
 *  day (same affirmation all day, a different one tomorrow), so the pool
 *  only needs to be wide and non-repetitive, not sign-specific (sign
 *  flavor is appended separately via getSignFlavorLine). */
const AFFIRMATION_TEMPLATES = [
  "I move through today at my own pace, and that pace is enough.",
  "My intuition has been right before — I trust it again today.",
  "I am allowed to take up space in my own life.",
  "Whatever today asks of me, I already have what I need to meet it.",
  "I release what I can't control and tend to what I can.",
  "Rest is not a detour from my path — it is part of it.",
  "I choose curiosity over judgment when I look at myself today.",
  "Small, steady steps are still real progress.",
  "I am the same person who has survived every hard day before this one.",
  "My feelings are information, not instructions — I can feel and still choose.",
  "Today I let something be easy instead of making it a struggle.",
  "I am allowed to change my mind as I learn more about myself.",
  "I don't have to earn rest — I can simply take it.",
  "My worth doesn't rise and fall with how productive I was today.",
  "I can hold two true things at once: this is hard, and I am handling it.",
  "I trust myself to figure it out as I go.",
  "Not every door that closes was meant to stay open.",
  "I am allowed to outgrow things that once fit me perfectly.",
  "The version of me a year from now will thank me for today's small effort.",
  "I don't need to understand everything right now to keep moving forward.",
  "My pace is not a flaw — it's information about what I actually need.",
  "I can set a boundary and still be kind.",
  "Today's discomfort is not a sign that I'm doing it wrong.",
  "I am allowed to ask for help without it meaning I've failed.",
  "What I'm feeling today will not be what I feel forever.",
  "I don't have to carry today's weight into tomorrow.",
  "I can be proud of how far I've come and still want more.",
  "My presence matters more than my performance today.",
  "I give myself permission to do this imperfectly.",
  "I am allowed to protect my energy without explaining why.",
  "The right people will meet me where I actually am.",
  "I don't need every answer today — just the next right step.",
  "I am capable of holding uncertainty without rushing to fix it.",
  "My softness is not weakness; it's where my strength is stored.",
  "I can let go of a plan without letting go of the goal.",
  "Today I choose progress over perfection.",
  "I am allowed to take the scenic route to where I'm going.",
  "My past doesn't get a vote in who I become next.",
  "I can be gentle with myself and still hold myself accountable.",
  "I trust that today's effort is building something I can't see yet.",
  "I don't owe anyone a version of myself that isn't true.",
  "My needs are not an inconvenience.",
  "I am allowed to enjoy something without justifying why.",
  "I can respect someone's choice and still make a different one.",
  "Today I listen to my body before I argue with it.",
  "I am allowed to rest before I'm completely empty.",
  "The things I'm avoiding tend to be smaller than the fear around them.",
  "I don't have to have it all figured out to take the next step.",
  "My quiet, unseen effort still counts.",
  "I can love people and still choose myself sometimes.",
  "I am not behind — I am exactly where my path has taken me.",
  "Today I let one thing be good enough instead of perfect.",
  "I trust the timing of my own life, even the slow parts.",
  "I can be a work in progress and still be whole right now.",
  "My boundaries are not a punishment to anyone — they're a gift to myself.",
  "I release the pressure to have today be a breakthrough.",
  "I am allowed to want more without rejecting what I already have.",
  "My intuition deserves a seat at the table, even when logic argues louder.",
  "I can forgive myself for what I didn't know back then.",
  "Today I choose one honest step over ten performed ones.",
  "I don't need to justify taking care of myself.",
  "I am allowed to show up differently than I did yesterday.",
  "My healing doesn't have to look like anyone else's.",
  "I can hold space for grief and gratitude at the same time.",
  "The plan can change without the person I'm becoming changing.",
  "I trust myself to know when enough is enough.",
  "I am allowed to celebrate something small.",
  "My sensitivity is a form of awareness, not a flaw.",
  "I don't have to carry what isn't mine to carry.",
  "Today I choose honesty with myself over comfort.",
  "I can want to grow and still be enough as I am right now.",
  "My rhythm doesn't have to match anyone else's.",
  "I release the need to prove myself to people who already decided.",
  "I am allowed to let a hard season be hard without rushing it.",
  "I trust that clarity comes from action, not just thinking.",
  "My past mistakes are proof I'm learning, not proof I'm broken.",
  "I can say \"I don't know yet\" and still be respected.",
  "Today I make room for something unexpected to go right.",
  "I am allowed to protect my peace, even from people I love.",
  "My effort today doesn't need an audience to be real.",
  "I trust the parts of me that are still figuring it out.",
  "I can be tired and still be moving in the right direction.",
  "My story isn't over just because this chapter is hard.",
  "I don't need permission to outgrow an old version of myself.",
  "Today I choose to meet myself with the same patience I'd offer a friend.",
  "I am allowed to want things to be different and accept them as they are, at the same time.",
  "My worth was never up for debate — I just forgot for a while.",
  "I trust that what's for me won't require me to abandon myself.",
  "I can hold my own hand through this.",
  "Today's version of trying is enough, even if it looks smaller than yesterday's.",
  "I am not responsible for managing everyone else's comfort.",
  "My needs don't disqualify me from being easy to love.",
  "I can release a grudge without releasing the lesson.",
  "Today I choose to speak to myself the way I want to be spoken to.",
  "I am allowed to take credit for how far I've come.",
  "My intuition has been quietly right more often than I give it credit for.",
  "I don't have to wait until I feel ready to begin.",
  "I can be a beginner at something and still be proud of starting.",
  "Today I let myself be exactly as far along as I actually am.",
  "I trust that this moment, however it feels, is not the whole story.",
];

const SIGN_FLAVOR: Partial<Record<ZodiacSign, string>> = {
  Aries: "Your fire wants a direction today — give it one, gently.",
  Taurus: "Let something move at its own pace; you don't have to rush the ground beneath you.",
  Gemini: "Your mind is busy — let one thought finish before reaching for the next.",
  Cancer: "Protecting your softness today is not the same as hiding it.",
  Leo: "You don't need an audience to know your own worth today.",
  Virgo: "Not everything needs fixing right now — some things just need noticing.",
  Libra: "Balance today isn't about pleasing everyone — it's about including yourself in the equation.",
  Scorpio: "What you're feeling intensely is still just information. Let it pass through.",
  Sagittarius: "The horizon will still be there tomorrow — you're allowed to stay a little longer today.",
  Capricorn: "Your worth isn't measured only in output today.",
  Aquarius: "Your difference is the point, not the problem.",
  Pisces: "The boundary between you and everyone else's feelings is allowed to exist.",
};

/** Picks a stable affirmation for the given day — same one all day for
 *  everyone on that date, a different one (from the 100-item pool above)
 *  the next day. Deliberately NOT sign-specific (so the pool doesn't need
 *  to be 12x the size) — sign-specific color comes from getSignFlavorLine. */
export function getAffirmationOfDay(sign: ZodiacSign, date: Date = new Date()): string {
  const seed = `affirm-${date.toDateString()}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AFFIRMATION_TEMPLATES[h % AFFIRMATION_TEMPLATES.length];
}

export function getSignFlavorLine(sign: ZodiacSign): string {
  return SIGN_FLAVOR[sign] ?? "Trust the quiet signal underneath the noise today.";
}

/** Light, one-line Moon-sign color for the Premium "detailed affirmation" —
 *  emotional/inner-life tone, deliberately gentle rather than technical. */
const MOON_FLAVOR: Partial<Record<ZodiacSign, string>> = {
  Aries: "Underneath, your Aries Moon wants to feel things fast and move through them just as quickly.",
  Taurus: "Underneath, your Taurus Moon settles fastest around something steady and familiar.",
  Gemini: "Underneath, your Gemini Moon needs to talk a feeling through before it fully makes sense.",
  Cancer: "Underneath, your Cancer Moon notices more than it lets on — give it a little privacy today.",
  Leo: "Underneath, your Leo Moon wants to be truly seen, not just noticed.",
  Virgo: "Underneath, your Virgo Moon feels calmer once one small thing is back in order.",
  Libra: "Underneath, your Libra Moon settles when a relationship feels balanced, not perfect.",
  Scorpio: "Underneath, your Scorpio Moon feels things at full volume — that's not too much, it's just true.",
  Sagittarius: "Underneath, your Sagittarius Moon needs a little room to roam before it can sit still.",
  Capricorn: "Underneath, your Capricorn Moon feels safest once something is quietly handled.",
  Aquarius: "Underneath, your Aquarius Moon needs space to feel things in its own order, not on schedule.",
  Pisces: "Underneath, your Pisces Moon absorbs more of today's mood than it shows — let some of it go.",
};

/** Light, one-line Ascendant/Rising-sign color — how today's energy reads
 *  to other people, not how it feels on the inside. */
const RISING_FLAVOR: Partial<Record<ZodiacSign, string>> = {
  Aries: "To others, your Aries Rising reads as ready to go before you've even decided to be.",
  Taurus: "To others, your Taurus Rising reads as calm and unshaken, even on a loud day.",
  Gemini: "To others, your Gemini Rising reads as quick and curious, already three questions ahead.",
  Cancer: "To others, your Cancer Rising reads as warm and a little protective, even with strangers.",
  Leo: "To others, your Leo Rising reads as confident, whether or not that's how you feel inside.",
  Virgo: "To others, your Virgo Rising reads as put-together, even mid-chaos.",
  Libra: "To others, your Libra Rising reads as easy to talk to and quick to put people at ease.",
  Scorpio: "To others, your Scorpio Rising reads as composed, giving very little away.",
  Sagittarius: "To others, your Sagittarius Rising reads as upbeat and a little bit unpredictable.",
  Capricorn: "To others, your Capricorn Rising reads as capable, like you've already got it handled.",
  Aquarius: "To others, your Aquarius Rising reads as a step outside the usual script.",
  Pisces: "To others, your Pisces Rising reads as gentle, like you're paying closer attention than you let on.",
};

export function getMoonFlavorLine(moonSign: ZodiacSign): string {
  return MOON_FLAVOR[moonSign] ?? "Your emotional undercurrent today has its own quiet logic — trust it.";
}

export function getRisingFlavorLine(risingSign: ZodiacSign): string {
  return RISING_FLAVOR[risingSign] ?? "How you come across today doesn't have to match everything you feel inside.";
}

export type MeditationScript = {
  title: string;
  durationMinutes: number;
  frequencyHz: number;
  lines: string[];
};

const KEYWORD_SCRIPTS: { match: RegExp; title: string; lines: string[] }[] = [
  {
    match: /sleep|insomnia|can'?t.*sleep|awake/i,
    title: "Settling Into Sleep",
    lines: [
      "Let your shoulders drop away from your ears, just a little further than feels necessary.",
      "You don't have to solve anything tonight. Tonight only asks you to rest.",
      "With each exhale, imagine today's thoughts setting down, one at a time, like stones placed gently on the ground.",
      "Your body already knows how to sleep. You only need to stop getting in its way.",
      "Feel the weight of the bed holding you — you are allowed to be held.",
    ],
  },
  {
    match: /work|stress|overwhelm|deadline|anxious/i,
    title: "A Reset After Pressure",
    lines: [
      "Right now, nothing is actually on fire. Let your nervous system hear that.",
      "Breathe in for four counts, hold for four, release for six — this alone tells your body it's safe to downshift.",
      "The task will still be there in five minutes. You, a little steadier, will meet it better.",
      "Notice one thing in the room around you that isn't demanding anything from you.",
      "You are allowed to come back to this slower pace for the rest of today.",
    ],
  },
  {
    match: /argument|fight|conflict|upset|hurt/i,
    title: "After the Argument",
    lines: [
      "Whatever was said, you are still whole. A conversation cannot undo that.",
      "Let the tightness in your chest soften, even if only by a fraction.",
      "You don't need to resolve this feeling right now — you only need to not be ruled by it.",
      "Picture the version of you five years from now, looking back gently at this moment.",
      "You can care about the relationship and still take care of yourself first, right now.",
    ],
  },
];

const DEFAULT_SCRIPT = {
  title: "A Five-Minute Reset",
  lines: [
    "Let your breath find its own rhythm, without trying to control it.",
    "Notice the points of contact between your body and whatever is supporting you.",
    "With each breath out, let one unnecessary tension leave with it.",
    "There is nowhere else you need to be for the next few minutes.",
    "When you're ready, let your attention widen gently back to the room.",
  ],
};

/** Generates a short guided-meditation script from a free-text prompt. */
export function generateMeditationScript(prompt: string, durationMinutes = 5): MeditationScript {
  const matchEntry = KEYWORD_SCRIPTS.find((k) => k.match.test(prompt));
  const base = matchEntry ?? { title: DEFAULT_SCRIPT.title, lines: DEFAULT_SCRIPT.lines };
  return {
    title: base.title,
    durationMinutes,
    frequencyHz: 432,
    lines: base.lines,
  };
}
