import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
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
import { ScreenBackground, GlassCard, OrnateFrame } from "@shared/components";
import { colors, spacing, typography } from "@shared/theme";
import { useT, useTranslatedTexts } from "@shared/i18n";
import { useUserStore } from "@shared/storage/useUserStore";
import { getMissionNumber, getNumerologyCompatibility, NumerologyValue } from "@shared/utils/numerology";
import { NumerologyStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<NumerologyStackParamList, "NumerologyMatch">;

const DEFAULT_PARTNER_DATE = new Date(1996, 5, 15);

/** Same small pulsing heart + dotted connector as the zodiac Match screen —
 *  duplicated rather than shared, same self-contained-screen style the
 *  zodiac version already uses. */
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

/** A round number badge — the numerology equivalent of the zodiac Match
 *  screen's sign icon, since there's no icon set for Life Path numbers. */
function NumberBadge({ value, active }: { value: number | null; active: boolean }) {
  return (
    <View style={[styles.badge, active ? styles.badgeActive : styles.badgePlaceholder]}>
      <Text style={[styles.badgeNumber, active && styles.badgeNumberActive]}>{value !== null ? value : "?"}</Text>
    </View>
  );
}

export function NumerologyMatchScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const profile = useUserStore((s) => s.profile);
  const [partnerDate, setPartnerDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const myBirthDate = profile?.birthDate ?? "1996-06-15";
  const myLifePath = getMissionNumber(myBirthDate) as NumerologyValue;
  const partnerLifePath = partnerDate
    ? (getMissionNumber(format(partnerDate, "yyyy-MM-dd")) as NumerologyValue)
    : null;

  const result = partnerLifePath !== null ? getNumerologyCompatibility(myLifePath, partnerLifePath) : null;
  const displayPercent = usePercentCountUp(result ? result.percent : null);
  const { texts: localizedMatch } = useTranslatedTexts(result ? [result.headline, result.blurb] : ["", ""]);

  return (
    <ScreenBackground variant="night">
      <OrnateFrame />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 5l-7 7 7 7" stroke={colors.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>{t("numerology.match.title")}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]} keyboardShouldPersistTaps="handled">
        <View style={styles.matchRow}>
          <View style={styles.matchSide}>
            <NumberBadge value={myLifePath} active />
            <Text style={styles.matchLabel}>{t("numerology.match.you")}</Text>
          </View>

          <View style={styles.matchCenter}>
            <ConnectorDots active={!!partnerDate} />
            <HeartPulse active={!!partnerDate} />
            <ConnectorDots active={!!partnerDate} />
          </View>

          <View style={styles.matchSide}>
            <NumberBadge value={partnerLifePath} active={!!partnerDate} />
            <Text style={styles.matchLabel}>{partnerDate ? t("numerology.match.partner") : t("numerology.match.choose")}</Text>
          </View>
        </View>

        {result && (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.percentWrap}>
            <Text style={styles.percentValue}>{displayPercent}%</Text>
            <Text style={styles.percentCaption}>{t("numerology.match.matchEnergy")}</Text>
          </Animated.View>
        )}

        <Text style={styles.prompt}>{t("numerology.match.pickPartnerDate")}</Text>

        <GlassCard style={styles.dateCard}>
          <Pressable style={styles.rowBetween} onPress={() => setShowDatePicker((s) => !s)}>
            <Text style={styles.dateLabel}>{t("numerology.match.dateLabel")}</Text>
            <View style={styles.rowValue}>
              <Text style={styles.dateValue}>
                {partnerDate ? format(partnerDate, "MMM d, yyyy") : t("numerology.match.selectDate")}
              </Text>
              <Svg width={9} height={14} viewBox="0 0 24 24" fill="none">
                <Path d="M9 5l7 7-7 7" stroke={colors.gold} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          </Pressable>

          {showDatePicker && (
            <>
              <DateTimePicker
                value={partnerDate ?? DEFAULT_PARTNER_DATE}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                maximumDate={new Date()}
                onChange={(_, selected) => {
                  if (Platform.OS === "android") setShowDatePicker(false);
                  if (selected) setPartnerDate(selected);
                }}
                themeVariant="dark"
                textColor={colors.textPrimary}
                style={styles.picker}
              />
              {Platform.OS === "ios" && (
                <Pressable onPress={() => setShowDatePicker(false)} style={styles.doneBtn} hitSlop={8}>
                  <Text style={styles.doneBtnText}>{t("common.done")}</Text>
                </Pressable>
              )}
            </>
          )}
        </GlassCard>

        {result && (
          <Animated.View entering={FadeInDown.duration(420)} style={{ marginTop: spacing.lg }}>
            <GlassCard glow sparkles>
              <Text style={styles.headline}>{localizedMatch[0] || result.headline}</Text>
              <Text style={styles.blurb}>{localizedMatch[1] || result.blurb}</Text>
            </GlassCard>
          </Animated.View>
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
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.4,
  },
  badgePlaceholder: { borderColor: colors.goldLineHairline },
  badgeActive: { borderColor: colors.gold, backgroundColor: colors.bg2 },
  badgeNumber: { color: colors.textTertiary, fontSize: 24, fontFamily: typography.h2.fontFamily },
  badgeNumberActive: { color: colors.gold },
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
  dateCard: { marginBottom: spacing.xs },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowValue: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  dateLabel: {
    color: colors.textTertiary,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
  dateValue: { color: colors.textPrimary, fontFamily: typography.bodyLg.fontFamily, fontSize: 15.5, fontWeight: "600" },
  picker: { alignSelf: "stretch", marginTop: spacing.xs },
  doneBtn: { alignSelf: "flex-end", paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  doneBtnText: { color: colors.gold, fontFamily: typography.label.fontFamily, fontSize: 13, fontWeight: "700" },
  headline: { color: colors.gold, fontFamily: typography.h2.fontFamily, fontSize: 20, textAlign: "center" },
  blurb: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 14, textAlign: "center", marginTop: spacing.sm, lineHeight: 21 },
});
