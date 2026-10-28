import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeIn } from "react-native-reanimated";
import { ScreenBackground, NatalLoader, OrnateFrame } from "@shared/components";
import { useOnboardingDraft } from "../onboardingDraftStore";
import { useUserStore } from "@shared/storage/useUserStore";
import { getZodiacSign } from "@shared/utils/astrology";
import { geocodeBirthCityWithTimeout, timezoneForCoords } from "@shared/utils/geocoding";
import { colors, spacing, typography } from "@shared/theme";
import { useT, useTList } from "@shared/i18n";
import { logOnboardingComplete } from "@shared/analytics/analytics";
import { syncProfileToFirestore } from "@shared/firebase/firestoreUsers";
import { UserProfile } from "@shared/types/user";
import { OnboardingStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Generating">;

export function GeneratingScreen({ navigation }: Props) {
  const draft = useOnboardingDraft();
  const setProfile = useUserStore((s) => s.setProfile);
  const [stepIndex, setStepIndex] = useState(0);
  const t = useT();
  const steps = useTList("onboarding.generating.steps");

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    }, 650);

    const timeout = setTimeout(async () => {
      const date = draft.birthDate ?? new Date(1996, 5, 15);
      const sunSign = getZodiacSign(date.getMonth() + 1, date.getDate());
      const city = draft.birthCity || null;

      // Natal-chart Stage 2b: if the person picked a suggestion from the
      // offline city autocomplete (CityAutocompleteInput), we already have
      // exact coordinates — just resolve the timezone for them, no device
      // geocoder round-trip needed. Otherwise fall back to Stage 2's
      // best-effort free-text geocode, time-boxed so a slow/unavailable
      // device geocoder never blocks onboarding — see geocoding.ts. Either
      // path falls back to null (same as before Stage 2) on any failure.
      const geocoded =
        draft.birthCityLat != null && draft.birthCityLon != null
          ? {
              lat: draft.birthCityLat,
              lon: draft.birthCityLon,
              timezone: timezoneForCoords(draft.birthCityLat, draft.birthCityLon),
            }
          : city
          ? await geocodeBirthCityWithTimeout(city)
          : null;

      const newProfile: UserProfile = {
        name: draft.name || "Seeker",
        gender: draft.gender ?? "Prefer not to say",
        birthDate: date.toISOString().slice(0, 10),
        birthTime: draft.birthTime
          ? `${String(draft.birthTime.getHours()).padStart(2, "0")}:${String(draft.birthTime.getMinutes()).padStart(2, "0")}`
          : null,
        birthCity: city,
        birthLat: geocoded?.lat ?? null,
        birthLon: geocoded?.lon ?? null,
        birthTimezone: geocoded?.timezone ?? null,
        relationshipStatus: draft.relationshipStatus ?? "Single",
        sunSign,
        onboardingComplete: true,
      };
      setProfile(newProfile);
      logOnboardingComplete();
      // Reports the freshly-filled-in profile to Firestore's Users
      // collection, keyed by this device's id — works even though nobody
      // has signed in yet. Best-effort; never blocks onboarding.
      syncProfileToFirestore(newProfile);
      draft.reset();
    }, 2700);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <ScreenBackground variant="night">
      <OrnateFrame />
      <View style={styles.container}>
        <NatalLoader size={160} />
        <Animated.View key={stepIndex} entering={FadeIn.duration(260)} style={styles.textWrap}>
          <Text style={styles.step}>{steps[stepIndex]}</Text>
        </Animated.View>
        <Text style={styles.caption}>{t("onboarding.generating.caption")}</Text>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg, paddingHorizontal: spacing.xl },
  textWrap: { minHeight: 28 },
  step: {
    color: colors.textPrimary,
    fontFamily: typography.body.fontFamily,
    fontSize: 15,
  },
  caption: {
    color: colors.gold,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
    textTransform: "uppercase",
    marginTop: spacing.md,
  },
});
