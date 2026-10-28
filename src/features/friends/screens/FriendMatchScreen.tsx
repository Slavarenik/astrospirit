import React, { useMemo, useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { ScreenBackground, GlassCard, ZodiacIcon, OrnateFrame, SectionHeader } from "@shared/components";
import { colors, radius, spacing, typography, ZodiacSign } from "@shared/theme";
import { useT, useTranslatedTexts } from "@shared/i18n";
import { useUserStore } from "@shared/storage/useUserStore";
import { useFriendsStore } from "@shared/storage/useFriendsStore";
import { getCompatibilityReport, getMoonSign, estimateAscendant, CompatibilityAreaKey } from "@shared/utils/astrology";
import { NatalChartWheel } from "@features/profile/components/NatalChartWheel";
import { ProfileStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<ProfileStackParamList, "FriendMatch">;

function usePercentCountUp(target: number) {
  const [display, setDisplay] = useState(0);
  const frame = useRef<number | null>(null);
  useEffect(() => {
    const start = Date.now();
    const duration = 900;
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * target));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target]);
  return display;
}

function AreaRow({ labelKey, percent, blurb, delay }: { labelKey: CompatibilityAreaKey; percent: number; blurb: string; delay: number }) {
  const t = useT();
  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withTiming(percent, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [percent]);
  const barStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  return (
    <Animated.View entering={FadeInDown.duration(360).delay(delay)} style={styles.areaRow}>
      <View style={styles.areaHeadRow}>
        <Text style={styles.areaLabel}>{t(`compatibilityReport.areas.${labelKey}`)}</Text>
        <Text style={styles.areaPercent}>{percent}%</Text>
      </View>
      <View style={styles.areaBarTrack}>
        <Animated.View style={[styles.areaBarFill, barStyle]} />
      </View>
      <Text style={styles.areaBlurb}>{blurb}</Text>
    </Animated.View>
  );
}

export function FriendMatchScreen({ navigation, route }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const profile = useUserStore((s) => s.profile);
  const friends = useFriendsStore((s) => s.friends);

  const primaryFriend = friends.find((f) => f.id === route.params.friendId);
  const otherFriends = friends.filter((f) => f.id !== route.params.friendId);

  const [compareWith, setCompareWith] = useState<string>("me");

  const mySign: ZodiacSign = profile?.sunSign ?? "Aries";
  const comparedFriend = compareWith === "me" ? null : otherFriends.find((f) => f.id === compareWith) ?? null;

  const leftLabel = compareWith === "me" ? t("match.you") : comparedFriend?.name ?? "";
  const leftSign: ZodiacSign = compareWith === "me" ? mySign : comparedFriend?.sunSign ?? mySign;

  const report = primaryFriend ? getCompatibilityReport(leftSign, primaryFriend.sunSign) : null;
  const displayPercent = usePercentCountUp(report ? report.percent : 0);

  const translationSource = report
    ? [report.headline, report.blurb, report.timing, report.advice, ...report.areas.map((ar) => ar.blurb)]
    : [];
  const { texts: localized } = useTranslatedTexts(translationSource.length ? translationSource : [""]);
  const [lHeadline, lBlurb, lTiming, lAdvice, ...lAreaBlurbs] = localized;

  const leftBirthDate = compareWith === "me" && profile ? new Date(profile.birthDate) : comparedFriend ? new Date(comparedFriend.birthDate) : new Date();
  const leftMoon = useMemo(() => getMoonSign(leftBirthDate), [leftBirthDate]);
  const leftAscendant = useMemo(() => estimateAscendant(leftSign, 12), [leftSign]);

  const rightBirthDate = primaryFriend ? new Date(primaryFriend.birthDate) : new Date();
  const rightMoon = useMemo(() => getMoonSign(rightBirthDate), [rightBirthDate]);
  const rightAscendant = useMemo(() => estimateAscendant(primaryFriend?.sunSign ?? "Aries", 12), [primaryFriend]);

  if (!primaryFriend) {
    return (
      <ScreenBackground variant="night">
        <OrnateFrame />
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M15 5l-7 7 7 7" stroke={colors.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={styles.backBtn} />
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground variant="night">
      <OrnateFrame />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 5l-7 7 7 7" stroke={colors.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>{primaryFriend.name}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}>
        {otherFriends.length > 0 && (
          <View style={styles.compareRow}>
            <Pressable onPress={() => setCompareWith("me")} style={[styles.compareChip, compareWith === "me" && styles.compareChipActive]}>
              <Text style={[styles.compareChipText, compareWith === "me" && styles.compareChipTextActive]}>{t("match.you")}</Text>
            </Pressable>
            {otherFriends.map((f) => (
              <Pressable
                key={f.id}
                onPress={() => setCompareWith(f.id)}
                style={[styles.compareChip, compareWith === f.id && styles.compareChipActive]}
              >
                <Text style={[styles.compareChipText, compareWith === f.id && styles.compareChipTextActive]}>{f.name}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.matchRow}>
          <View style={styles.matchSide}>
            <ZodiacIcon sign={leftSign} size={72} variant="filled" sparkles laurel />
            <Text style={styles.matchLabel}>{leftLabel.toUpperCase()}</Text>
          </View>
          <View style={styles.matchCenter}>
            <Text style={styles.percentValue}>{displayPercent}%</Text>
          </View>
          <View style={styles.matchSide}>
            <ZodiacIcon sign={primaryFriend.sunSign} size={72} variant="filled" sparkles laurel />
            <Text style={styles.matchLabel}>{primaryFriend.name.toUpperCase()}</Text>
          </View>
        </View>

        {report && (
          <Animated.View entering={FadeInDown.duration(420)} style={{ marginTop: spacing.lg }}>
            <GlassCard glow sparkles>
              <Text style={styles.headline}>{lHeadline || report.headline}</Text>
              <Text style={styles.blurb}>{lBlurb || report.blurb}</Text>
            </GlassCard>
          </Animated.View>
        )}

        {report && (
          <View style={{ marginTop: spacing.lg }}>
            <SectionHeader title={t("compatibilityReport.fullReport")} />
            <GlassCard style={{ marginTop: spacing.sm }}>
              {report.areas.map((ar, i) => (
                <View key={ar.key} style={i > 0 ? styles.areaDivider : undefined}>
                  <AreaRow labelKey={ar.key} percent={ar.percent} blurb={lAreaBlurbs[i] || ar.blurb} delay={i * 70} />
                </View>
              ))}
            </GlassCard>

            <Animated.View entering={FadeInDown.duration(400).delay(360)} style={{ marginTop: spacing.md }}>
              <GlassCard>
                <Text style={styles.cardTitle}>{t("compatibilityReport.timingTitle")}</Text>
                <Text style={styles.cardBody}>{lTiming || report.timing}</Text>
              </GlassCard>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(400).delay(430)} style={{ marginTop: spacing.md }}>
              <GlassCard glow>
                <Text style={styles.cardTitle}>{t("compatibilityReport.adviceTitle")}</Text>
                <Text style={styles.cardBody}>{lAdvice || report.advice}</Text>
              </GlassCard>
            </Animated.View>
          </View>
        )}

        <View style={{ marginTop: spacing.xl }}>
          <SectionHeader title={t("passport.eyebrow")} />
          <View style={styles.natalRow}>
            <View style={styles.natalCol}>
              <Text style={styles.natalLabel}>{leftLabel.toUpperCase()}</Text>
              <NatalChartWheel sun={leftSign} moon={leftMoon} ascendant={leftAscendant} size={150} />
            </View>
            <View style={styles.natalCol}>
              <Text style={styles.natalLabel}>{primaryFriend.name.toUpperCase()}</Text>
              <NatalChartWheel sun={primaryFriend.sunSign} moon={rightMoon} ascendant={rightAscendant} size={150} />
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  backBtn: { width: 34, height: 34, justifyContent: "center" },
  headerTitle: { color: colors.gold, fontFamily: typography.h3.fontFamily, fontSize: 17, letterSpacing: 1.4 },
  content: { paddingHorizontal: spacing.lg },
  compareRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.sm },
  compareChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
  },
  compareChipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  compareChipText: { color: colors.textTertiary, fontSize: 12, fontFamily: typography.label.fontFamily },
  compareChipTextActive: { color: colors.textOnAccent, fontWeight: "700" },
  matchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.md },
  matchSide: { alignItems: "center", gap: spacing.xs, width: 100 },
  matchLabel: {
    color: colors.textSecondary,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
    textAlign: "center",
  },
  matchCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  percentValue: { color: colors.gold, fontFamily: typography.display.fontFamily, fontSize: 36, letterSpacing: 1 },
  headline: { color: colors.gold, fontFamily: typography.h2.fontFamily, fontSize: 20, textAlign: "center" },
  blurb: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 14, textAlign: "center", marginTop: spacing.sm, lineHeight: 21 },
  areaRow: { paddingVertical: spacing.sm },
  areaDivider: { borderTopWidth: 1, borderTopColor: colors.hairline },
  areaHeadRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  areaLabel: { color: colors.textPrimary, fontFamily: typography.h3.fontFamily, fontSize: 14.5 },
  areaPercent: { color: colors.gold, fontFamily: typography.bodyLg.fontFamily, fontSize: 14, fontWeight: "700" },
  areaBarTrack: { height: 6, borderRadius: 3, backgroundColor: colors.bg3, marginTop: spacing.xs, overflow: "hidden" },
  areaBarFill: { height: 6, borderRadius: 3, backgroundColor: colors.gold },
  areaBlurb: { color: colors.textTertiary, fontFamily: typography.body.fontFamily, fontSize: 12.5, lineHeight: 18, marginTop: spacing.xs },
  cardTitle: {
    color: colors.gold,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
    marginBottom: spacing.xs,
  },
  cardBody: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 14, lineHeight: 21 },
  natalRow: { flexDirection: "row", justifyContent: "space-around", marginTop: spacing.sm },
  natalCol: { alignItems: "center", gap: spacing.xs },
  natalLabel: {
    color: colors.textTertiary,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
});
