import { useMemo } from "react";
import { useUserStore } from "@shared/storage/useUserStore";
import { buildBirthInstant, getMoonSign, resolveAscendant } from "@shared/utils/astrology";
import { getMoonFlavorLine, getRisingFlavorLine } from "@shared/utils/aiContent";
import { ZodiacSign } from "@shared/theme";

export type AffirmationDetail = {
  moonSign: ZodiacSign;
  moonFlavor: string;
  risingSign: ZodiacSign;
  risingFlavor: string;
};

/** The Premium "detailed affirmation" add-on: Moon sign + Ascendant, computed
 *  the same way as the Astro Passport card (buildBirthInstant/getMoonSign/
 *  resolveAscendant — real ephemeris when the profile is geocoded, an honest
 *  estimate otherwise), paired with a short, gentle flavor line for each so
 *  the affirmation can reference them lightly instead of staying Sun-sign-only. */
export function useAffirmationDetail(): AffirmationDetail {
  const profile = useUserStore((s) => s.profile);

  return useMemo(() => {
    const sunSign: ZodiacSign = profile?.sunSign ?? "Aries";
    const birthHour = profile?.birthTime ? parseInt(profile.birthTime.split(":")[0], 10) : 12;
    const birthDate = profile?.birthDate ?? "1996-06-15";
    const birthTime = profile?.birthTime ?? null;

    const birthInstant = buildBirthInstant(birthDate, birthTime);
    const moonSign = getMoonSign(birthInstant);
    const { sign: risingSign } = resolveAscendant(
      sunSign,
      birthHour,
      birthDate,
      birthTime,
      profile?.birthLat ?? null,
      profile?.birthLon ?? null,
      profile?.birthTimezone ?? null
    );

    return {
      moonSign,
      moonFlavor: getMoonFlavorLine(moonSign),
      risingSign,
      risingFlavor: getRisingFlavorLine(risingSign),
    };
  }, [profile]);
}
