import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { ScreenBackground, GlassCard, GlowButton, NatalLoader, OrnateFrame } from "@shared/components";
import { colors, radius, spacing, typography } from "@shared/theme";
import { translateTexts, useLocaleStore, useT } from "@shared/i18n";
import { useIntentionsStore } from "@shared/storage/useIntentionsStore";
import { todayKey } from "@shared/storage/useCardOfDayStore";
import { analyzeJournalEntry, SentimentResult } from "@shared/utils/sentiment";
import { CalendarStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<CalendarStackParamList, "EveningJournal">;

const MOOD_COLOR: Record<SentimentResult["mood"], string> = {
  low: colors.rose,
  neutral: colors.textTertiary,
  good: colors.teal,
  great: colors.accent,
};

export function EveningJournalScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const locale = useLocaleStore((s) => s.locale);
  const addEntry = useIntentionsStore((s) => s.addJournalEntry);
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<SentimentResult | null>(null);

  const handleAnalyze = () => {
    if (text.trim().length < 3) return;
    setAnalyzing(true);
    setTimeout(async () => {
      const sentiment = analyzeJournalEntry(text);
      const [summary, suggestion, ...triggers] = await translateTexts(
        [sentiment.summary, sentiment.suggestion, ...sentiment.triggers],
        locale
      );
      const localized: SentimentResult = {
        ...sentiment,
        summary,
        suggestion,
        triggers,
      };
      setResult(localized);
      addEntry({
        id: `${Date.now()}`,
        dateKey: todayKey(),
        text,
        mood: localized.mood,
        sentiment: localized,
      });
      setAnalyzing(false);
    }, 1400);
  };

  return (
    <ScreenBackground variant="night">
      <OrnateFrame />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M15 5l-7 7 7 7" stroke={colors.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <Text style={styles.headerTitle}>{t("journal.title")}</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
          keyboardShouldPersistTaps="handled"
        >
          {!result && !analyzing && (
            <Animated.View entering={FadeIn}>
              <Text style={styles.prompt}>{t("journal.prompt")}</Text>
              <Text style={styles.sub}>{t("journal.sub")}</Text>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={t("journal.placeholder")}
                placeholderTextColor={colors.textTertiary}
                style={styles.textArea}
                multiline
                autoFocus
              />
              <GlowButton
                title={t("journal.reflect")}
                onPress={handleAnalyze}
                disabled={text.trim().length < 3}
                style={{ marginTop: spacing.lg }}
              />
            </Animated.View>
          )}

          {analyzing && (
            <View style={styles.loadingWrap}>
              <NatalLoader size={100} label={t("journal.reading")} />
            </View>
          )}

          {result && (
            <Animated.View entering={FadeInDown.duration(420)}>
              <GlassCard glow sparkles>
                <View style={styles.moodRow}>
                  <View style={[styles.moodDot, { backgroundColor: MOOD_COLOR[result.mood] }]} />
                  <Text style={styles.moodLabel}>{t(`journal.mood.${result.mood}`)}</Text>
                </View>
                <Text style={styles.summary}>{result.summary}</Text>
              </GlassCard>

              <GlassCard style={{ marginTop: spacing.sm }}>
                <Text style={styles.sectionLabel}>{t("journal.triggers")}</Text>
                <View style={styles.chipRow}>
                  {result.triggers.map((trigger) => (
                    <View key={trigger} style={styles.chip}>
                      <Text style={styles.chipText}>{trigger}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>

              <GlassCard style={{ marginTop: spacing.sm }}>
                <Text style={styles.sectionLabel}>{t("journal.forTomorrow")}</Text>
                <Text style={styles.summary}>{result.suggestion}</Text>
              </GlassCard>

              <GlowButton
                title={t("journal.done")}
                variant="outline"
                onPress={() => navigation.goBack()}
                style={{ marginTop: spacing.lg }}
              />
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  prompt: { color: colors.textPrimary, fontFamily: typography.h1.fontFamily, fontSize: 24 },
  sub: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 14, marginTop: 4, marginBottom: spacing.lg },
  textArea: {
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
    backgroundColor: colors.bg2,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 180,
    color: colors.textPrimary,
    fontFamily: typography.body.fontFamily,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: "top",
  },
  loadingWrap: { alignItems: "center", justifyContent: "center", paddingVertical: spacing.xxxl * 1.5 },
  moodRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.sm },
  moodDot: { width: 10, height: 10, borderRadius: 5 },
  moodLabel: { color: colors.textPrimary, fontFamily: typography.label.fontFamily, fontSize: typography.micro.fontSize, letterSpacing: typography.label.letterSpacing },
  summary: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 14.5, lineHeight: 21 },
  sectionLabel: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: colors.bg3 },
  chipText: { color: colors.textSecondary, fontSize: 12, fontFamily: typography.caption.fontFamily },
});
