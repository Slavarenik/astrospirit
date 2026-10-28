import { ZodiacSign } from "@shared/theme";
import { HoroscopeIndexes } from "./horoscopeAnalysis";

/**
 * "What to do / what not to do" — three tips each, shown under the daily
 * horoscope paragraph. Same stand-in philosophy as aiContent.ts and
 * horoscopeAnalysis.ts: a wide, hand-written pool plus a deterministic
 * seeded pick, swappable for a real text-AI call later (keep the
 * (sign, date, indexes) → { doTips, dontTips } signature).
 *
 * Picked FROM the day's indexes (energy/intuition/tension/luck) rather
 * than re-scanning the horoscope text again — those indexes are already
 * derived from that day's paragraph (see horoscopeAnalysis.ts), so a tip
 * selected because "tension is high today" is still a tip chosen because
 * of what today's reading actually says, just one step removed. Whichever
 * axis sits furthest from neutral (50) leads the selection — that's today's
 * strongest signal — with low-signal days backfilled from a general pool
 * so there are always exactly three of each.
 */

type AxisKey = keyof HoroscopeIndexes;
type AxisState = "high" | "low";

function axisState(indexes: HoroscopeIndexes, axis: AxisKey): AxisState | null {
  const v = indexes[axis];
  if (v >= 66) return "high";
  if (v <= 40) return "low";
  return null;
}

function seededIndex(seed: string, offset: number, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i) + offset * 97) >>> 0;
  return h % mod;
}

/** Deterministically pulls `count` distinct items from `pool`, skipping
 *  anything already in `exclude` (shared across do/don't within one call
 *  so the same line never appears twice in one list). */
function pickUnique(pool: string[], seed: string, offsetStart: number, count: number, exclude: Set<string>): string[] {
  const picked: string[] = [];
  let offset = offsetStart;
  let attempts = 0;
  while (picked.length < count && attempts < pool.length * 3) {
    const candidate = pool[seededIndex(seed, offset, pool.length)];
    if (!exclude.has(candidate)) {
      picked.push(candidate);
      exclude.add(candidate);
    }
    offset++;
    attempts++;
  }
  return picked;
}

const DO_ENERGY_HIGH = [
  "Put today's extra drive behind ONE thing, not five — it'll go further focused than scattered.",
  "Use the momentum while it's here: start the task you've been circling instead of planning it again.",
  "Move your body before you sit down to think — the energy wants an outlet, not a to-do list.",
  "Say yes to the thing that needs a push, not the thing that needs patience.",
  "Front-load the hardest task to the start of your day, while the drive is highest.",
];
const DONT_ENERGY_HIGH = [
  "Don't mistake restlessness for direction — pick a target before you spend the energy.",
  "Don't start five new things just because you suddenly have the fuel for them.",
  "Don't schedule back-to-back today assuming this pace holds tomorrow.",
  "Don't pick a fight just because you have the adrenaline to win it.",
  "Don't skip the warm-up or prep step — fast still needs a foundation.",
];
const DO_ENERGY_LOW = [
  "Work in short, deliberate bursts today and let that be enough — it doesn't need to be a marathon.",
  "Protect one hour of real rest before you decide you're \"too tired\" to rest.",
  "Do the one task that actually matters and let the rest wait a day.",
  "Lower the bar on purpose today — finished-and-imperfect beats not-started.",
  "Ask for help with the one thing that's draining you most.",
];
const DONT_ENERGY_LOW = [
  "Don't force a big push today — you'll just borrow tomorrow's energy at a worse rate.",
  "Don't schedule anything irreversible on a low-fuel day.",
  "Don't read low energy as laziness — it's information, not a character flaw.",
  "Don't cancel rest to make room for one more task.",
  "Don't make a big decision today that can honestly wait until you're rested.",
];

const DO_INTUITION_HIGH = [
  "Write down the gut feeling before you talk yourself out of it.",
  "Trust the quiet read you got on a person or situation today — act on it, gently.",
  "Give yourself ten quiet minutes alone before you answer something important.",
  "Follow the thought that keeps circling back, even if it doesn't fully make sense yet.",
  "Notice what you're avoiding looking at directly — that's usually where the insight is.",
];
const DONT_INTUITION_HIGH = [
  "Don't drown the instinct in other people's opinions before you've even sat with it.",
  "Don't overthink a read that came to you fast and clear — that's usually the accurate one.",
  "Don't ignore a hesitation just because you can't fully explain it yet.",
  "Don't fill every quiet moment with a screen — the insight needs the quiet to surface.",
  "Don't dismiss a dream or stray thought today as \"just noise.\"",
];
const DO_INTUITION_LOW = [
  "Lean on facts and a second opinion today rather than a gut call you can't quite trust yet.",
  "Sleep on the decision if you possibly can — clarity is more available tomorrow.",
  "Ask someone you trust what they're noticing that you might be missing.",
  "Write the confusing situation down in plain words — naming it plainly often clears it.",
  "Give yourself permission to say \"I don't know yet\" today.",
];
const DONT_INTUITION_LOW = [
  "Don't force a read on something you're genuinely unclear about — wait a day.",
  "Don't make the big call on a day your own signal feels foggy.",
  "Don't assume confusion means something is wrong — sometimes it just means not yet.",
  "Don't isolate with an unclear feeling; a second perspective will help more than more solo thinking.",
  "Don't mistake overthinking for insight today — they're not the same thing.",
];

const DO_TENSION_HIGH = [
  "Name the friction out loud, to yourself first — it loses some of its grip once it's named.",
  "Take the hard conversation in small, calm pieces rather than one big confrontation.",
  "Build in one buffer today — extra time, a pause before replying, anything that softens the edge.",
  "Move the tension through your body (a walk, a stretch, a few minutes outside) before you try to think your way out of it.",
  "Pick the one thing you can actually resolve today and let the rest stay unresolved for now.",
];
const DONT_TENSION_HIGH = [
  "Don't send the message while you're still in the heat of it — it can wait an hour.",
  "Don't grip tighter on the thing that's stuck; it usually loosens when you stop forcing it.",
  "Don't pack today's schedule full — tension needs room, not more pressure.",
  "Don't take today's friction as proof the whole plan is wrong.",
  "Don't let one difficult moment set the tone for how you treat everyone else today.",
];
const DO_TENSION_LOW = [
  "Use the ease today to tackle the thing you've been dreading — it'll go smoother than expected.",
  "Have the conversation you've been postponing; conditions are better than they'll feel like they are.",
  "Enjoy the calm without waiting for the other shoe to drop.",
  "Catch up on the small things that pile up during harder weeks.",
  "Let something be simple today instead of looking for the complication.",
];
const DONT_TENSION_LOW = [
  "Don't manufacture drama just because today feels unusually quiet.",
  "Don't skip the easy win today assuming you'll have the same ease tomorrow.",
  "Don't let the calm make you careless with a commitment that still matters.",
  "Don't use today's ease as a reason to avoid a conversation that's actually ready now.",
  "Don't mistake low tension for low importance — some things still deserve your attention.",
];

const DO_LUCK_HIGH = [
  "Say yes to the unexpected opening today — this is the kind of day it's built for.",
  "Reach out first; today favors the person who makes the move.",
  "Put in the application, send the message, make the ask — the odds are better than usual.",
  "Follow the lead that seems too easy to be real; sometimes it just is that easy.",
  "Share the good news or good moment instead of downplaying it.",
];
const DONT_LUCK_HIGH = [
  "Don't let a lucky break make you careless with the follow-through.",
  "Don't assume today's ease will carry a plan that still needs real work behind it.",
  "Don't sit on the opportunity \"to think about it\" past today.",
  "Don't credit luck alone — notice what you actually did right so you can repeat it.",
  "Don't gamble more than you'd be fine losing just because today feels favorable.",
];
const DO_LUCK_LOW = [
  "Lower the stakes today — pick the reversible option over the big bet.",
  "Focus on effort you control rather than outcomes you don't, today especially.",
  "Double-check the details you'd normally skim; today rewards carefulness over speed.",
  "Treat a setback today as timing, not a verdict on the plan itself.",
  "Build something small and solid rather than reaching for a big win right now.",
];
const DONT_LUCK_LOW = [
  "Don't make the big, hard-to-reverse decision on a day that feels this unlucky.",
  "Don't take a closed door personally — re-knock another day.",
  "Don't chase a loss by doubling down today.",
  "Don't skip the fine print or the backup plan today.",
  "Don't let one frustrating moment convince you the whole week is cursed.",
];

const DO_GENERAL = [
  "Do one thing today that future-you will be glad you didn't put off.",
  "Check in with your body before you check your phone.",
  "Say the honest thing, kindly, instead of the comfortable half-truth.",
  "Give one relationship five real minutes of your full attention today.",
  "Finish one small thing completely instead of starting three.",
  "Drink water, eat something real, and treat that as non-negotiable today.",
  "Write down the one thought you don't want to forget today.",
  "Let today be good enough instead of perfect.",
  "Take the five-minute version of self-care if the sixty-minute version isn't realistic today.",
  "Notice one thing that's actually going right before the day ends.",
];
const DONT_GENERAL = [
  "Don't compare today's chapter to someone else's highlight reel.",
  "Don't let the one hard moment define how you'd grade the whole day.",
  "Don't skip the thing that keeps you steady just because today feels fine.",
  "Don't make a promise today you're not sure you can keep tomorrow.",
  "Don't carry someone else's mood as if it has to become yours.",
  "Don't put off the apology or the thank-you you've been meaning to say.",
  "Don't let \"busy\" quietly turn into \"burnt out\" without noticing.",
  "Don't scroll past the thing that's actually bothering you instead of naming it.",
  "Don't treat rest as something you have to earn first.",
  "Don't let today's to-do list decide how worthy you are.",
];

const AXIS_POOLS: Record<AxisKey, Record<AxisState, { doPool: string[]; dontPool: string[] }>> = {
  energy: {
    high: { doPool: DO_ENERGY_HIGH, dontPool: DONT_ENERGY_HIGH },
    low: { doPool: DO_ENERGY_LOW, dontPool: DONT_ENERGY_LOW },
  },
  intuition: {
    high: { doPool: DO_INTUITION_HIGH, dontPool: DONT_INTUITION_HIGH },
    low: { doPool: DO_INTUITION_LOW, dontPool: DONT_INTUITION_LOW },
  },
  tension: {
    high: { doPool: DO_TENSION_HIGH, dontPool: DONT_TENSION_HIGH },
    low: { doPool: DO_TENSION_LOW, dontPool: DONT_TENSION_LOW },
  },
  luck: {
    high: { doPool: DO_LUCK_HIGH, dontPool: DONT_LUCK_HIGH },
    low: { doPool: DO_LUCK_LOW, dontPool: DONT_LUCK_LOW },
  },
};

export type DailyTips = {
  doTips: string[];
  dontTips: string[];
};

/** Three "do" + three "don't" tips for the day, selected from the axes
 *  (energy/intuition/tension/luck) that sit furthest from neutral today —
 *  i.e. today's strongest signals in the already-derived indexes — with a
 *  general pool backfilling anything a quiet, close-to-neutral day leaves
 *  short. Deterministic per sign+date, same spirit as the rest of this
 *  module's stand-in content. */
export function getDailyTips(sign: ZodiacSign, date: Date, indexes: HoroscopeIndexes): DailyTips {
  const seed = `${sign}-tips-${date.toDateString()}`;
  const axes: AxisKey[] = ["energy", "intuition", "tension", "luck"];
  const ordered = [...axes].sort((a, b) => Math.abs(indexes[b] - 50) - Math.abs(indexes[a] - 50));

  const doTips: string[] = [];
  const dontTips: string[] = [];
  const doUsed = new Set<string>();
  const dontUsed = new Set<string>();
  let offset = 0;

  for (const axis of ordered) {
    const state = axisState(indexes, axis);
    if (!state) continue;
    const { doPool, dontPool } = AXIS_POOLS[axis][state];
    if (doTips.length < 3) doTips.push(...pickUnique(doPool, seed, offset, 1, doUsed));
    offset += 1;
    if (dontTips.length < 3) dontTips.push(...pickUnique(dontPool, seed, offset, 1, dontUsed));
    offset += 1;
  }

  if (doTips.length < 3) doTips.push(...pickUnique(DO_GENERAL, seed, offset, 3 - doTips.length, doUsed));
  offset += 3;
  if (dontTips.length < 3) dontTips.push(...pickUnique(DONT_GENERAL, seed, offset, 3 - dontTips.length, dontUsed));

  return { doTips: doTips.slice(0, 3), dontTips: dontTips.slice(0, 3) };
}
