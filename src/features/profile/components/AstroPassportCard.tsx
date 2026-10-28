import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GlassCard, FadeInUp, ZodiacIcon, GlowButton } from "@shared/components";
import { colors, spacing, typography, ZodiacSign } from "@shared/theme";
import { useT, useTranslatedTexts } from "@shared/i18n";
import { NatalChartWheel } from "./NatalChartWheel";
import { useUserStore } from "@shared/storage/useUserStore";
import { usePremiumStore } from "@shared/storage/usePremiumStore";
import { usePaywallNavigation } from "@shared/hooks/usePaywallNavigation";
import { buildBirthInstant, getMoonSign, getWholeSignHouse, resolveAscendant } from "@shared/utils/astrology";
import { geocodeBirthCityWithTimeout } from "@shared/utils/geocoding";
import { SUN_EXPLANATION, MOON_EXPLANATION, RISING_EXPLANATION } from "../data/signExplanations";
import { ProfileStackParamList } from "@app/navigation/types";

// Matches the outline GlowButton's own label color (styles.labelOther in
// GlowButton.tsx), since this only ever sits inside that variant here.
function LockIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
      <Path d="M6 11V8a6 6 0 1112 0v3" stroke={colors.gold} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M5 11h14v9H5z" stroke={colors.gold} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

export function AstroPassportCard() {
  const t = useT();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const goToPaywall = usePaywallNavigation();

  const birthHour = profile?.birthTime ? parseInt(profile.birthTime.split(":")[0], 10) : 12;
  const sunSign: ZodiacSign = profile?.sunSign ?? "Aries";
  const birthInstant = buildBirthInstant(profile?.birthDate ?? "1996-06-15", profile?.birthTime ?? null);
  const moon = getMoonSign(birthInstant);
  const { sign: ascendant } = resolveAscendant(
    sunSign,
    birthHour,
    profile?.birthDate ?? "1996-06-15",
    profile?.birthTime ?? null,
    profile?.birthLat ?? null,
    profile?.birthLon ?? null,
    profile?.birthTimezone ?? null
  );
  const sunHouse = getWholeSignHouse(sunSign, ascendant);

  // Natal-chart Stage 2 self-healing: profiles created before geocoding
  // existed (or where it failed during onboarding) get one best-effort
  // retry here, since this card mounts whenever there's a profile at all.
  // Never overwrites an already-geocoded profile; silently does nothing if
  // it fails again — same honest "estimate" experience as before Stage 2.
  useEffect(() => {
    if (!profile || !profile.birthCity || profile.birthLat != null) return;
    let cancelled = false;
    geocodeBirthCityWithTimeout(profile.birthCity).then((geo) => {
      if (cancelled || !geo) return;
      updateProfile({ birthLat: geo.lat, birthLon: geo.lon, birthTimezone: geo.timezone });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.birthCity, profile?.birthLat]);

  const rows = useMemo(
    () => [
      {
        key: "sun",
        planetKey: "passport.sun",
        sign: sunSign,
        glyph: "☉",
        text: SUN_EXPLANATION[sunSign],
      },
      {
        key: "moon",
        planetKey: "passport.moon",
        sign: moon,
        glyph: "☾",
        text: MOON_EXPLANATION[moon],
      },
      {
        key: "rising",
        planetKey: "passport.rising",
        sign: ascendant,
        glyph: "ASC",
        text: RISING_EXPLANATION[ascendant],
      },
    ],
    [sunSign, moon, ascendant]
  );

  const { texts: localizedExplanations } = useTranslatedTexts(rows.map((r) => r.text));

  // The deep natal chart (full planetary chart + its aspects) is one bundled
  // premium feature — both entry points below funnel through this same gate
  // rather than navigating straight to FullChart.
  const handleViewFullChart = () => {
    if (!isPremium) {
      goToPaywall();
      return;
    }
    navigation.navigate("FullChart");
  };

  if (!profile) return null;

  return (
    <FadeInUp>
      <GlassCard glow sparkles>
        <Text style={styles.eyebrow}>{t("passport.eyebrow")}</Text>
        <Text style={styles.name}>{profile.name}</Text>

        <View style={styles.wheelRow}>
          <NatalChartWheel sun={profile.sunSign} moon={moon} ascendant={ascendant} size={220} />
        </View>

        <View style={styles.rows}>
          {rows.map((r, i) => (
            <View key={r.key} style={styles.row}>
              <View style={styles.badge}>
                <Text style={styles.badgeGlyph}>{r.glyph}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.rowTitleWrap}>
                  <Text style={styles.rowTitle}>
                    {t("passport.inSign")
                      .replace("{{planet}}", t(r.planetKey))
                      .replace("{{sign}}", t(`signs.${r.sign}`))}
                  </Text>
                  <ZodiacIcon sign={r.sign} size={18} variant="plain" />
                </View>
                <Text style={styles.rowText}>{localizedExplanations[i] ?? r.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable onPress={handleViewFullChart} style={styles.houseLine}>
          <Text style={styles.houseLineText}>
            {t("passport.sunHouseLine")
              .replace("{{n}}", String(sunHouse))
              .replace("{{name}}", t(`houses.names.${sunHouse}`))}
          </Text>
        </Pressable>

        <GlowButton
          title={t("passport.viewFullChart")}
          variant="outline"
          onPress={handleViewFullChart}
          icon={!isPremium ? <LockIcon /> : undefined}
          style={{ marginTop: spacing.lg, alignSelf: "stretch" }}
        />
      </GlassCard>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
  name: { color: colors.textPrimary, fontFamily: typography.h1.fontFamily, fontSize: 24, marginTop: 2 },
  wheelRow: { alignItems: "center", marginVertical: spacing.lg },
  rows: { gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.goldLine,
  },
  badgeGlyph: { color: colors.accent, fontSize: 14, fontWeight: "700" },
  rowTitleWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowTitle: { color: colors.textPrimary, fontFamily: typography.body.fontFamily, fontSize: 14.5, fontWeight: "600" },
  rowText: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 13, marginTop: 2, lineHeight: 19 },
  houseLine: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    backgroundColor: colors.bg1,
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
  },
  houseLineText: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: 12.5,
    textAlign: "center",
  },
});
