import { useEffect, useState } from "react";
import { useUserStore } from "@shared/storage/useUserStore";
import { useLocaleStore } from "@shared/storage/useLocaleStore";
import { horoscopeApi } from "@shared/api/horoscopeClient";
import { translateText } from "@shared/i18n/googleTranslate";
import { getDailyIndexes, getZodiacSign } from "@shared/utils/astrology";
import { analyzeHoroscopeIndexes, HoroscopeIndexes } from "@shared/utils/horoscopeAnalysis";
import { getDailyTips, DailyTips } from "@shared/utils/dailyTips";
import { getAffirmationOfDay, getSignFlavorLine } from "@shared/utils/aiContent";
import { ZodiacSign } from "@shared/theme";

export type HoroscopePeriod = "daily" | "weekly" | "monthly";

type DailyState = {
  loading: boolean;
  horoscopeText: string;
  indexes: HoroscopeIndexes;
  affirmation: string;
  sign: ZodiacSign;
  source: "api" | "local";
  refresh: () => void;
};

type HoroscopeState = {
  loading: boolean;
  horoscopeText: string;
  indexes: HoroscopeIndexes;
  tips: DailyTips;
  sign: ZodiacSign;
  source: "api" | "local";
  refresh: () => void;
};

const LOCAL_FALLBACKS: Record<HoroscopePeriod, string[]> = {
  daily: [
    "Today favors quiet momentum over big declarations. Small, consistent choices compound faster than you expect.",
    "A conversation or thought you've been circling is ready to resolve — give it direct attention today.",
    "Your energy runs better in short, focused bursts today rather than one long push. Honor the rhythm.",
    "Something that felt stuck starts to loosen. Don't force it — just stop gripping so tightly.",
    "Pay attention to what (or who) makes you feel most like yourself today. That's useful data.",
  ],
  weekly: [
    "This week rewards follow-through over fresh starts — finish what you already began before opening anything new.",
    "A theme that's been circling for a few weeks comes into sharper focus. Trust the pattern you're seeing.",
    "Expect one conversation this week to shift how you're thinking about a bigger decision. Stay open to it.",
    "Your week runs smoother if you protect one or two non-negotiable anchors — everything else can flex around them.",
    "Something you've been avoiding gets easier to face by midweek. The dread is usually worse than the task.",
  ],
  monthly: [
    "This month is less about a single breakthrough and more about compounding — the small habits you keep now matter most.",
    "A chapter that's quietly been closing finishes this month. Let it, rather than trying to extend it.",
    "Expect a shift in priorities around the middle of the month — don't lock in plans too rigidly before then.",
    "Relationships (personal or professional) carry more weight than usual this month — invest attention there.",
    "You'll have more clarity by month's end than you do right now. Patience is the actual work this month.",
  ],
};

function localFallback(sign: ZodiacSign, date: Date, period: HoroscopePeriod): string {
  const seed = `${sign}-horoscope-${period}-${date.toDateString()}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const pool = LOCAL_FALLBACKS[period];
  return `${pool[h % pool.length]} ${getSignFlavorLine(sign)}`;
}

const PERIOD_FETCHERS: Record<HoroscopePeriod, (sign: ZodiacSign) => Promise<{ horoscope: string }>> = {
  daily: (sign) => horoscopeApi.getDaily(sign),
  weekly: (sign) => horoscopeApi.getWeekly(sign),
  monthly: (sign) => horoscopeApi.getMonthly(sign),
};

/** Fetches the horoscope paragraph for a given period (day/week/month) for
 *  the user's sun sign, with a deterministic local fallback if the API is
 *  unreachable. Text is then localized via Google Translate for ru/uk.
 *  The daily energy/intuition/tension/luck indexes are derived by analyzing
 *  that same paragraph's ENGLISH text (see `horoscopeAnalysis.ts`) — they
 *  reflect what today's specific reading says, not an independent roll. */
export function useHoroscope(period: HoroscopePeriod): HoroscopeState {
  const profile = useUserStore((s) => s.profile);
  const locale = useLocaleStore((s) => s.locale);
  const sign: ZodiacSign = profile?.sunSign ?? getZodiacSign(6, 15);
  const [loading, setLoading] = useState(true);
  const [horoscopeText, setHoroscopeText] = useState("");
  const [source, setSource] = useState<"api" | "local">("local");
  const [tick, setTick] = useState(0);

  const today = new Date();
  // Shown instantly on mount/sign-change, before the async analysis below
  // has a horoscope paragraph to read — replaced as soon as it does.
  const [indexes, setIndexes] = useState<HoroscopeIndexes>(() => getDailyIndexes(sign, today));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      let english = "";
      let nextSource: "api" | "local" = "local";
      try {
        const data = await PERIOD_FETCHERS[period](sign);
        english = data.horoscope;
        nextSource = "api";
      } catch {
        english = localFallback(sign, today, period);
        nextSource = "local";
      }

      if (!cancelled) {
        setIndexes(analyzeHoroscopeIndexes(english, sign, today));
      }

      console.log(`[i18n] horoscope fetch (${nextSource}) locale=${locale} len=${english.length}`);
      const localized = await translateText(english, locale);
      if (cancelled) return;
      console.log(
        `[i18n] horoscope set locale=${locale} sameAsEn=${localized === english} preview="${localized.slice(0, 50)}…"`
      );
      setHoroscopeText(localized);
      setSource(nextSource);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [sign, period, tick, locale]);

  return {
    loading,
    horoscopeText: horoscopeText || localFallback(sign, today, period),
    indexes,
    tips: getDailyTips(sign, today, indexes),
    sign,
    source,
    refresh: () => setTick((t) => t + 1),
  };
}

/** @deprecated prefer useHoroscope("daily") — kept so AffirmationWidget's
 *  `affirmation` usage doesn't need to change. */
export function useDailyHoroscope(): DailyState {
  const daily = useHoroscope("daily");
  const affirmation = getAffirmationOfDay(daily.sign, new Date());
  return { ...daily, affirmation };
}
