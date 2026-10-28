import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { format, subDays } from "date-fns";
import { enUS, ru, uk } from "date-fns/locale";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming, Easing } from "react-native-reanimated";
import { GlassCard, FadeInUp, SectionHeader } from "@shared/components";
import { colors, radius, spacing, typography } from "@shared/theme";
import { useT, useLocaleStore } from "@shared/i18n";
import { useIntentionsStore, TRACKERS_PER_DAY } from "@shared/storage/useIntentionsStore";

const BAR_HEIGHT = 80;
const DFS_LOCALES = { en: enUS, ru, uk } as const;

function Bar({ value, max, delay, label }: { value: number; max: number; delay: number; label: string }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withTiming(max > 0 ? value / max : 0, { duration: 700, easing: Easing.out(Easing.cubic) }));
  }, [value, max]);

  const style = useAnimatedStyle(() => ({ height: 6 + progress.value * BAR_HEIGHT }));

  return (
    <View style={styles.barCol}>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, style]} />
      </View>
      <Text style={styles.barLabel}>{label}</Text>
    </View>
  );
}

export function MindfulnessStats() {
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  const trackerLog = useIntentionsStore((s) => s.trackerLog);
  const journal = useIntentionsStore((s) => s.journal);
  const streak = useIntentionsStore((s) => s.streakDays());

  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const key = format(d, "yyyy-MM-dd");
      return { label: format(d, "EEEEE", { locale: DFS_LOCALES[locale] }), value: (trackerLog[key] ?? []).length };
    });
  }, [trackerLog, locale]);

  const maxTrackers = TRACKERS_PER_DAY;
  const totalCompletions = Object.values(trackerLog).reduce((sum, arr) => sum + arr.length, 0);
  const estimatedMinutes = totalCompletions * 4 + journal.length * 6;

  return (
    <FadeInUp delay={100}>
      <GlassCard sparkles>
        <SectionHeader title={t("stats.title")} subtitle={t("stats.subtitle")} />

        <View style={styles.statRow}>
          <Stat value={streak} label={t("stats.dayStreak")} />
          <Stat value={journal.length} label={t("stats.journalEntries")} />
          <Stat value={`${estimatedMinutes}m`} label={t("stats.mindfulMinutes")} />
        </View>

        <Text style={styles.chartLabel}>{t("stats.last7")}</Text>
        <View style={styles.chartRow}>
          {last7.map((d, i) => (
            <Bar key={i} value={d.value} max={maxTrackers} delay={i * 80} label={d.label} />
          ))}
        </View>
      </GlassCard>
    </FadeInUp>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.lg, marginTop: spacing.xs },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { color: colors.accent, fontFamily: typography.h2.fontFamily, fontSize: 22 },
  statLabel: { color: colors.textTertiary, fontFamily: typography.caption.fontFamily, fontSize: 11, marginTop: 2, textAlign: "center" },
  chartLabel: { color: colors.textTertiary, fontFamily: typography.caption.fontFamily, fontSize: 12, marginBottom: spacing.sm },
  chartRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  barCol: { alignItems: "center", gap: 6, flex: 1 },
  barTrack: { width: 14, height: BAR_HEIGHT + 6, justifyContent: "flex-end", backgroundColor: colors.bg3, borderRadius: radius.sm },
  barFill: { width: 14, borderRadius: radius.sm, backgroundColor: colors.accent },
  barLabel: { color: colors.textTertiary, fontSize: 10.5, fontFamily: typography.micro.fontFamily },
});
