import { NumerologyValue } from "@shared/utils/numerology";

/** Destiny Number — every Latin letter of the full name (Pythagorean
 *  letter values), summed and reduced. The broader life direction the
 *  person is built for, as distinct from the birth-date numbers. */
export const DESTINY_EXPLANATION: Record<NumerologyValue, string> = {
  1: "Your path points toward independence — you're built to lead and originate, not imitate.",
  2: "Your path points toward partnership — you're built to mediate, support, and bring people together.",
  3: "Your path points toward creative expression — you're built to communicate, perform, or make things others feel.",
  4: "Your path points toward building — you're built to create order and structures that hold up over time.",
  5: "Your path points toward variety — you're built for movement, new experience, and adaptability.",
  6: "Your path points toward care and responsibility — you're built to nurture, teach, or steward others.",
  7: "Your path points toward understanding — you're built to study, question, and go deeper than the surface.",
  8: "Your path points toward achievement — you're built to organize resources and lead at scale.",
  9: "Your path points toward service — you're built to give, teach, or work for something beyond yourself.",
  11: "A master path — heightened sensitivity aimed at inspiring or illuminating others, not just yourself.",
  22: "A master path — the drive to turn a large vision into something real and lasting for many people.",
};

/** Soul Urge Number — only the vowels of the name. What a person wants
 *  underneath, regardless of what they show on the outside. */
export const SOUL_URGE_EXPLANATION: Record<NumerologyValue, string> = {
  1: "Deep down, you want to lead your own life, on your own terms.",
  2: "Deep down, you want closeness — real connection and peace matter more to you than winning.",
  3: "Deep down, you want to create and be genuinely seen for it.",
  4: "Deep down, you want stability — something solid under your feet before anything else.",
  5: "Deep down, you want freedom — room to move, explore, and not be boxed in.",
  6: "Deep down, you want to belong — to love and be needed by the people around you.",
  7: "Deep down, you want truth — answers that actually hold up, not comfortable guesses.",
  8: "Deep down, you want to matter — through accomplishment, standing, or impact.",
  9: "Deep down, you want to give — your satisfaction comes from being useful to something bigger.",
  11: "Deep down, a master-level pull toward insight — you want what you sense to mean something to someone else too.",
  22: "Deep down, a master-level pull to build — you want your efforts to outlast you.",
};

/** Personality Number — only the consonants of the name. The first
 *  impression people get, before they actually know someone — mirrors the
 *  framing of RISING_EXPLANATION in signExplanations.ts. */
export const PERSONALITY_EXPLANATION: Record<NumerologyValue, string> = {
  1: "You come across as assured and self-directed before people know the rest of you.",
  2: "You come across as easygoing and accommodating before people know the rest of you.",
  3: "You come across as lively and expressive before people know the rest of you.",
  4: "You come across as grounded and dependable before people know the rest of you.",
  5: "You come across as restless and adventurous before people know the rest of you.",
  6: "You come across as warm and responsible before people know the rest of you.",
  7: "You come across as reserved and watchful before people know the rest of you.",
  8: "You come across as capable and in-command before people know the rest of you.",
  9: "You come across as generous and a little larger-than-life before people know the rest of you.",
  11: "You come across with an unusual intensity — people sense there's more going on under the surface.",
  22: "You come across as quietly powerful — people trust you with bigger things almost on instinct.",
};
