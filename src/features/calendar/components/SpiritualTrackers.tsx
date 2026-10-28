import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { GlassCard, FadeInUp, SectionHeader } from "@shared/components";
import { colors, radius, spacing, typography } from "@shared/theme";
import { useT, useTranslatedTexts } from "@shared/i18n";
import { useIntentionsStore, getTodayTrackers, TrackerId } from "@shared/storage/useIntentionsStore";
import { todayKey } from "@shared/storage/useCardOfDayStore";
import { logTrackerCompleted } from "@shared/analytics/analytics";

function TrackerRow({ id, label, total }: { id: TrackerId; label: string; total: number }) {
  const done = useIntentionsStore((s) => s.isTrackerDone(todayKey(), id));
  const toggle = useIntentionsStore((s) => s.toggleTracker);
  const scale = useSharedValue(1);
  const checkProgress = useSharedValue(done ? 1 : 0);

  useEffect(() => {
    checkProgress.value = withSpring(done ? 1 : 0, { damping: 12, stiffness: 220 });
  }, [done]);

  const rowStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkProgress.value,
    transform: [{ scale: checkProgress.value }],
  }));
  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: done ? colors.accent : "transparent",
    borderColor: done ? colors.accent : colors.hairlineStrong,
  }));

  return (
    <Animated.View style={rowStyle}>
      <Pressable
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          scale.value = withSpring(0.98, { damping: 10 }, () => {
            scale.value = withSpring(1);
          });
          const completingNow = !done;
          toggle(todayKey(), id);
          if (completingNow) {
            const doneCountAfter = (useIntentionsStore.getState().trackerLog[todayKey()] ?? []).length;
            logTrackerCompleted(id, total > 0 && doneCountAfter >= total);
          }
        }}
        style={styles.row}
      >
        <Animated.View style={[styles.checkbox, boxStyle]}>
          <Animated.View style={checkStyle}>
            <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
              <Path d="M5 13l4 4 10-10" stroke={colors.textOnAccent} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Animated.View>
        </Animated.View>
        <Text style={[styles.label, done && styles.labelDone]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function ProgressBadge({ doneCount, total }: { doneCount: number; total: number }) {
  const allDone = total > 0 && doneCount >= total;

  return (
    <View style={[styles.progressBadge, allDone && styles.progressBadgeDone]}>
      {allDone ? (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <Path d="M5 13l4 4 10-10" stroke={colors.textOnAccent} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ) : (
        <Text style={styles.progressText}>
          {doneCount}/{total}
        </Text>
      )}
    </View>
  );
}

export function SpiritualTrackers() {
  const t = useT();
  const streak = useIntentionsStore((s) => s.streakDays());
  const trackerLog = useIntentionsStore((s) => s.trackerLog);
  const todaysPicks = useMemo(() => getTodayTrackers(todayKey()), []);
  const { texts: labels } = useTranslatedTexts(todaysPicks.map((item) => item.label));

  const doneCount = useMemo(() => {
    const completed = new Set(trackerLog[todayKey()] ?? []);
    return todaysPicks.filter((item) => completed.has(item.id)).length;
  }, [trackerLog, todaysPicks]);

  const total = todaysPicks.length;
  const allDone = total > 0 && doneCount >= total;

  return (
    <FadeInUp delay={100}>
      <GlassCard sparkles>
        <SectionHeader
          title={t("trackers.title")}
          subtitle={
            allDone
              ? t("trackers.allDone")
              : streak > 0
                ? t("trackers.dayStreak").replace("{{n}}", String(streak))
                : t("trackers.startToday")
          }
          right={<ProgressBadge doneCount={doneCount} total={total} />}
        />
        <View style={{ marginTop: spacing.xs }}>
          {todaysPicks.map((item, i) => (
            <TrackerRow key={item.id} id={item.id} label={labels[i] ?? item.label} total={total} />
          ))}
        </View>
      </GlassCard>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    marginTop: 1,
    borderRadius: radius.sm * 0.6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  label: {
    flex: 1,
    flexShrink: 1,
    color: colors.textPrimary,
    fontFamily: typography.body.fontFamily,
    fontSize: 14.5,
    lineHeight: 20,
  },
  labelDone: { color: colors.textTertiary, textDecorationLine: "line-through" },
  progressBadge: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    minWidth: 36,
    height: 28,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  progressBadgeDone: {
    backgroundColor: colors.accent,
    minWidth: 28,
    width: 28,
    paddingHorizontal: 0,
  },
  progressText: {
    color: colors.accent,
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    fontWeight: "700",
  },
});
