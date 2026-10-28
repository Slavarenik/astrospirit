import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { ScreenBackground, GlassCard, ZodiacIcon, OrnateFrame, SectionHeader, GlowButton } from "@shared/components";
import { colors, radius, spacing, typography, ZODIAC_SIGNS, ZodiacSign } from "@shared/theme";
import { useT, useTranslatedTexts } from "@shared/i18n";
import { useUserStore } from "@shared/storage/useUserStore";
import { usePremiumStore } from "@shared/storage/usePremiumStore";
import { usePaywallNavigation } from "@shared/hooks/usePaywallNavigation";
import { getCompatibilityReport, CompatibilityAreaKey } from "@shared/utils/astrology";
import { ProfileStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<ProfileStackParamList, "Compatibility">;

function LockIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path d="M6 11V8a6 6 0 1112 0v3" stroke={colors.textTertiary} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M5 11h14v9H5z" stroke={colors.textTertiary} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

/** Small gold line-art heart glyph that pulses once a match is revealed —
 *  the "zodiac <3 zodiac" animation the reference asks for. */
function HeartPulse({ active }: { active: boolean }) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.5);

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.22, { duration: 360, easing: Easing.out(Easing.cubic) }),
          withTiming(1, { duration: 420, easing: Easing.inOut(Easing.cubic) })
        ),
        -1,
        false
      );
      glow.value = withRepeat(withSequence(withTiming(1, { duration: 360 }), withTiming(0.55, { duration: 420 })), -1, false);
    } else {
      scale.value = withTiming(1, { duration: 200 });
      glow.value = withTiming(0.5, { duration: 200 });
    }
  }, [active]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: glow.value,
  }));

  return (
    <Animated.View style={style}>
      <Svg width={30} height={26} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 20.2S3 14.6 3 8.6C3 5.5 5.3 3.4 8 3.4c1.8 0 3.3 1 4 2.4.7-1.4 2.2-2.4 4-2.4 2.7 0 5 2.1 5 4.8 0 6-9 11.6-9 11.6z"
          stroke={colors.gold}
          strokeWidth={1.6}
          strokeLinejoin="round"
          fill={active ? colors.gold : "transparent"}
        />
      </Svg>
    </Animated.View>
  );
}

/** Animated gold-dotted connector line between the two sign badges, drawn
 *  short-to-long once a partner sign is chosen. */
function ConnectorDots({ active }: { active: boolean }) {
  const progress = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 420 });
  }, [active]);
  const style = useAnimatedStyle(() => ({ opacity: progress.value }));
  return (
    <Animated.View style={[styles.connector, style]}>
      {Array.from({ length: 5 }).map((_, i) => (
        <View key={i} style={styles.dot} />
      ))}
    </Animated.View>
  );
}

function usePercentCountUp(target: number | null) {
  const [display, setDisplay] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (target === null) {
      setDisplay(0);
      return;
    }
    const start = Date.now();
    const duration = 900;
    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * target));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target]);

  return display;
}

/** One row of the area-by-area breakdown: label, animated bar, translated blurb. */
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

export function CompatibilityScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const profile = useUserStore((s) => s.profile);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const goToPaywall = usePaywallNavigation();
  const [partnerSign, setPartnerSign] = useState<ZodiacSign | null>(null);

  const mySign = profile?.sunSign ?? "Aries";
  const report = partnerSign ? getCompatibilityReport(mySign, partnerSign) : null;
  const displayPercent = usePercentCountUp(report ? report.percent : null);

  const translationSource = report
    ? [report.headline, report.blurb, report.timing, report.advice, ...report.areas.map((ar) => ar.blurb)]
    : ["", "", "", "", "", "", "", "", ""];
  const { texts: localized } = useTranslatedTexts(translationSource);
  const [lHeadline, lBlurb, lTiming, lAdvice, ...lAreaBlurbs] = localized;

  return (
    <ScreenBackground variant="night">
      <OrnateFrame />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 5l-7 7 7 7" stroke={colors.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>{t("match.title")}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <View style={styles.matchRow}>
          <View style={styles.matchSide}>
            <ZodiacIcon sign={mySign} size={72} variant="filled" sparkles laurel />
            <Text style={styles.matchLabel}>{t(`signs.${mySign}`).toUpperCase()}</Text>
          </View>

          <View style={styles.matchCenter}>
            <ConnectorDots active={!!partnerSign} />
            <HeartPulse active={!!partnerSign} />
            <ConnectorDots active={!!partnerSign} />
          </View>

          <View style={styles.matchSide}>
            {partnerSign ? (
              <ZodiacIcon sign={partnerSign} size={72} variant="filled" sparkles laurel />
            ) : (
              <View style={styles.placeholderBadge}>
                <Text style={styles.placeholderMark}>?</Text>
              </View>
            )}
            <Text style={styles.matchLabel}>
              {partnerSign ? t(`signs.${partnerSign}`).toUpperCase() : t("match.choose")}
            </Text>
          </View>
        </View>

        {report && (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.percentWrap}>
            <Text style={styles.percentValue}>{displayPercent}%</Text>
            <Text style={styles.percentCaption}>{t("match.matchEnergy")}</Text>
          </Animated.View>
        )}

        <Text style={styles.prompt}>{t("match.pickPartner")}</Text>

        <View style={styles.signGrid}>
          {ZODIAC_SIGNS.map((sign) => {
            const active = sign === partnerSign;
            return (
              <Pressable key={sign} onPress={() => setPartnerSign(sign)} style={styles.signChip}>
                <ZodiacIcon sign={sign} size={38} variant={active ? "filled" : "ring"} />
                <Text style={[styles.signLabel, active && styles.signLabelActive]}>{t(`signs.${sign}`)}</Text>
              </Pressable>
            );
          })}
        </View>

        {report && !isPremium && (
          <Animated.View entering={FadeInDown.duration(420)} style={{ marginTop: spacing.lg }}>
            <GlassCard glow sparkles style={styles.lockedCard}>
              <View style={styles.lockedIconWrap}>
                <LockIcon />
              </View>
              <Text style={styles.lockedTitle}>{t("compatibilityReport.premiumLocked.title")}</Text>
              <Text style={styles.lockedBody}>{t("compatibilityReport.premiumLocked.body")}</Text>
              <GlowButton
                title={t("compatibilityReport.premiumLocked.cta")}
                onPress={goToPaywall}
                style={{ marginTop: spacing.md }}
              />
            </GlassCard>
          </Animated.View>
        )}

        {report && isPremium && (
          <Animated.View entering={FadeInDown.duration(420)} style={{ marginTop: spacing.lg }}>
            <GlassCard glow sparkles>
              <Text style={styles.headline}>{lHeadline || report.headline}</Text>
              <Text style={styles.blurb}>{lBlurb || report.blurb}</Text>
            </GlassCard>
          </Animated.View>
        )}

        {report && isPremium && (
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
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  backBtn: { width: 34, height: 34, justifyContent: "center" },
  headerTitle: { color: colors.gold, fontFamily: typography.h3.fontFamily, fontSize: 17, letterSpacing: 1.4 },
  content: { paddingHorizontal: spacing.lg },
  matchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.lg },
  matchSide: { alignItems: "center", gap: spacing.xs, width: 92 },
  matchLabel: {
    color: colors.textSecondary,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
  matchCenter: { flex: 1, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 },
  connector: { flexDirection: "row", gap: 4 },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.gold },
  placeholderBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.4,
    borderColor: colors.goldLineHairline,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderMark: { color: colors.textTertiary, fontSize: 24, fontFamily: typography.h2.fontFamily },
  percentWrap: { alignItems: "center", marginTop: spacing.lg },
  percentValue: { color: colors.gold, fontFamily: typography.display.fontFamily, fontSize: 44, letterSpacing: 1 },
  percentCaption: {
    color: colors.textTertiary,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
    marginTop: 2,
  },
  prompt: {
    color: colors.textSecondary,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  signGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, justifyContent: "space-between" },
  signChip: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginBottom: spacing.xs,
  },
  signLabel: { color: colors.textTertiary, fontSize: 9.5, fontFamily: typography.micro.fontFamily },
  signLabelActive: { color: colors.gold },
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
  lockedCard: { alignItems: "center" },
  lockedIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bg3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  lockedTitle: { color: colors.gold, fontFamily: typography.h3.fontFamily, fontSize: 16, textAlign: "center" },
  lockedBody: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: 13.5,
    textAlign: "center",
    marginTop: spacing.xs,
    lineHeight: 19,
  },
});
