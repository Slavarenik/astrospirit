import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { ScreenBackground, OrnateFrame, GlassCard, FadeInUp } from "@shared/components";
import { colors, radius, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { useIntentionsStore } from "@shared/storage/useIntentionsStore";
import { computeJournalInsights, MIN_ENTRIES_FOR_TREND, MoodKey } from "../utils/journalInsights";
import { MoodSparkline } from "../components/MoodSparkline";
import { CalendarStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<CalendarStackParamList, "JournalInsights">;

const MOOD_COLOR: Record<MoodKey, string> = {
  low: colors.rose,
  neutral: colors.textTertiary,
  good: colors.teal,
  great: colors.accent,
};

export function JournalInsightsScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const journal = useIntentionsStore((s) => s.journal);

  const insights = useMemo(() => computeJournalInsights(journal, 30), [journal]);
  const { mostFrequentMood, moodCounts, totalEntries, sparklineValues, weekdayWeekendPattern, weekOverWeekTrend } = insights;

  const hasEntries = totalEntries > 0;
  const hasTrend = totalEntries >= MIN_ENTRIES_FOR_TREND;

  const patternLines = useMemo(() => {
    const lines: string[] = [];
    if (weekdayWeekendPattern !== "insufficient") {
      lines.push(t(`journal.insights.weekdayWeekend.${weekdayWeekendPattern}`));
    }
    if (weekOverWeekTrend !== "insufficient") {
      lines.push(t(`journal.insights.weekOverWeek.${weekOverWeekTrend}`));
    }
    return lines;
  }, [weekdayWeekendPattern, weekOverWeekTrend, t]);

  return (
    <ScreenBackground>
      <OrnateFrame />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 5l-7 7 7 7" stroke={colors.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>{t("journal.insights.title")}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <FadeInUp>
          <Text style={styles.subtitle}>{t("journal.insights.subtitle")}</Text>
        </FadeInUp>

        {!hasEntries && (
          <FadeInUp delay={120}>
            <GlassCard sparkles style={{ marginTop: spacing.lg }}>
              <Text style={styles.emptyText}>{t("journal.insights.empty")}</Text>
            </GlassCard>
          </FadeInUp>
        )}

        {hasEntries && (
          <>
            <FadeInUp delay={120}>
              <GlassCard sparkles style={{ marginTop: spacing.lg }}>
                <Text style={styles.sectionLabel}>{t("journal.insights.mostFrequentTitle")}</Text>
                <View style={styles.moodRow}>
                  {mostFrequentMood && <View style={[styles.moodDot, { backgroundColor: MOOD_COLOR[mostFrequentMood] }]} />}
                  <Text style={styles.moodLabel}>{mostFrequentMood ? t(`journal.mood.${mostFrequentMood}`) : "—"}</Text>
                </View>
                <Text style={styles.body}>
                  {mostFrequentMood
                    ? t("journal.insights.mostFrequentBody")
                        .replace("{{mood}}", t(`journal.mood.${mostFrequentMood}`))
                        .replace("{{count}}", String(moodCounts[mostFrequentMood]))
                        .replace("{{total}}", String(totalEntries))
                    : null}
                </Text>
              </GlassCard>
            </FadeInUp>

            <FadeInUp delay={220}>
              <GlassCard glow style={{ marginTop: spacing.sm }}>
                <Text style={styles.sectionLabel}>{t("journal.insights.trendTitle")}</Text>
                {hasTrend ? (
                  <>
                    <View style={styles.sparklineWrap}>
                      <MoodSparkline values={sparklineValues} width={260} height={64} />
                    </View>
                    <View style={styles.trendHintRow}>
                      <Text style={styles.trendHint}>{t("journal.insights.trendHintStart")}</Text>
                      <Text style={styles.trendHint}>{t("journal.insights.trendHintEnd")}</Text>
                    </View>
                  </>
                ) : (
                  <Text style={styles.body}>{t("journal.insights.notEnoughForTrend")}</Text>
                )}
              </GlassCard>
            </FadeInUp>

            {patternLines.length > 0 && (
              <FadeInUp delay={300}>
                <GlassCard sparkles style={{ marginTop: spacing.sm }}>
                  <Text style={styles.sectionLabel}>{t("journal.insights.patternsTitle")}</Text>
                  {patternLines.map((line, i) => (
                    <Text key={i} style={[styles.body, i > 0 && { marginTop: spacing.xs }]}>
                      {"• "}
                      {line}
                    </Text>
                  ))}
                </GlassCard>
              </FadeInUp>
            )}

            <FadeInUp delay={380}>
              <Text style={styles.footerNote}>
                {t("journal.insights.entriesCount").replace("{{count}}", String(totalEntries))}
              </Text>
            </FadeInUp>
          </>
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
  headerTitle: { color: colors.gold, fontFamily: typography.h3.fontFamily, fontSize: 17, letterSpacing: 1.2 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, flexGrow: 1 },
  subtitle: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 14, lineHeight: 20 },
  emptyText: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 14.5, lineHeight: 21, textAlign: "center" },
  sectionLabel: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  moodRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.xs },
  moodDot: { width: 10, height: 10, borderRadius: 5 },
  moodLabel: { color: colors.textPrimary, fontFamily: typography.h3.fontFamily, fontSize: 18 },
  body: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 14, lineHeight: 20 },
  sparklineWrap: { alignItems: "center", marginTop: spacing.xs },
  trendHintRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.xxs, paddingHorizontal: 6 },
  trendHint: { color: colors.textTertiary, fontFamily: typography.caption.fontFamily, fontSize: 11 },
  footerNote: {
    color: colors.textTertiary,
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    textAlign: "center",
    marginTop: spacing.md,
  },
});
