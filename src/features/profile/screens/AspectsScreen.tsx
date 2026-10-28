import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { ScreenBackground, OrnateFrame, GlassCard, FadeInUp } from "@shared/components";
import { colors, spacing, typography, PLANET_GLYPHS, PlanetKey } from "@shared/theme";
import { useT, useTranslatedTexts } from "@shared/i18n";
import { useUserStore } from "@shared/storage/useUserStore";
import {
  buildBirthInstant,
  buildPreciseBirthInstant,
  getNatalPlacements,
  getNatalAspects,
  AspectType,
} from "@shared/utils/astrology";
import { ASPECT_EXPLANATION } from "../data/aspectExplanations";
import { AspectWheel } from "../components/AspectWheel";
import { ProfileStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<ProfileStackParamList, "Aspects">;

const ASPECT_ORDER: AspectType[] = ["conjunction", "sextile", "square", "trine", "opposition"];

const ASPECT_DOT_COLOR: Record<AspectType, string> = {
  conjunction: colors.gold,
  sextile: colors.teal,
  trine: colors.success,
  square: colors.rose,
  opposition: colors.danger,
};

function planetLabel(key: PlanetKey, t: (path: string) => string): string {
  return key === "sun" || key === "moon" ? t(`passport.${key}`) : t(`fullChart.planets.${key}`);
}

export function AspectsScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const profile = useUserStore((s) => s.profile);

  const birthDateIso = profile?.birthDate ?? "1996-06-15";
  const birthTime = profile?.birthTime ?? null;

  const birthInstant = useMemo(() => {
    if (profile?.birthTimezone) {
      return buildPreciseBirthInstant(birthDateIso, birthTime, profile.birthTimezone).instant;
    }
    return buildBirthInstant(birthDateIso, birthTime);
  }, [birthDateIso, birthTime, profile?.birthTimezone]);

  const placements = useMemo(() => getNatalPlacements(birthInstant), [birthInstant]);
  const aspects = useMemo(() => getNatalAspects(placements), [placements]);

  // One explanation per aspect type, in a fixed order, translated once —
  // rows below reuse the matching translated entry rather than each row
  // re-running its own translation of the same type's text.
  const sourceTexts = ASPECT_ORDER.map((type) => ASPECT_EXPLANATION[type]);
  const { texts: localized } = useTranslatedTexts(sourceTexts);
  const explanationFor = (type: AspectType) => {
    const i = ASPECT_ORDER.indexOf(type);
    return localized[i] || sourceTexts[i];
  };

  return (
    <ScreenBackground variant="night">
      <OrnateFrame />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 5l-7 7 7 7" stroke={colors.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>{t("aspects.title")}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Text style={styles.subtitle}>{t("aspects.subtitle")}</Text>

        <View style={styles.wheelRow}>
          <AspectWheel placements={placements} aspects={aspects} size={320} />
        </View>

        {aspects.length === 0 ? (
          <FadeInUp>
            <GlassCard sparkles>
              <Text style={styles.emptyText}>{t("aspects.empty")}</Text>
            </GlassCard>
          </FadeInUp>
        ) : (
          <View style={styles.rowsWrap}>
            {aspects.map((asp, i) => (
              <FadeInUp key={`${asp.a}-${asp.b}`} delay={i * 40}>
                <GlassCard style={styles.aspectCard}>
                  <View style={styles.aspectHeader}>
                    <View style={[styles.dot, { backgroundColor: ASPECT_DOT_COLOR[asp.type] }]} />
                    <Text style={styles.aspectType}>{t(`aspects.types.${asp.type}`)}</Text>
                  </View>
                  <Text style={styles.pairLine}>
                    {PLANET_GLYPHS[asp.a]} {planetLabel(asp.a, t)}
                    {"   ↔   "}
                    {PLANET_GLYPHS[asp.b]} {planetLabel(asp.b, t)}
                  </Text>
                  <Text style={styles.explanation}>{explanationFor(asp.type)}</Text>
                </GlassCard>
              </FadeInUp>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backBtn: { width: 34, height: 34, justifyContent: "center" },
  headerTitle: { color: colors.textPrimary, fontFamily: typography.h3.fontFamily, fontSize: 17, fontWeight: "600" },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  wheelRow: { alignItems: "center", marginBottom: spacing.lg },
  emptyText: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 14, textAlign: "center" },
  rowsWrap: { gap: spacing.sm },
  aspectCard: { marginBottom: spacing.sm },
  aspectHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  aspectType: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
  pairLine: { color: colors.textPrimary, fontFamily: typography.h3.fontFamily, fontSize: 15.5, fontWeight: "600" },
  explanation: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
});
