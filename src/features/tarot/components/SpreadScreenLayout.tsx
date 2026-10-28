import React from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { ScreenBackground, GlassCard, OrnateFrame, GlowButton } from "@shared/components";
import { colors, radius, spacing, typography } from "@shared/theme";
import { useT, useTranslatedTexts } from "@shared/i18n";
import { TarotCard } from "../data/tarotCatalog";

export type SpreadResultEntry = { key: string; label: string; card: TarotCard; reversed: boolean };

function ResultCard({ label, card, reversed }: { label: string; card: TarotCard; reversed: boolean }) {
  const t = useT();
  const meaning = reversed ? card.meaning.reversed : card.meaning.upright;
  const { texts } = useTranslatedTexts([meaning]);
  const meaningText = texts[0] ?? meaning;

  return (
    <GlassCard style={styles.resultCard} sparkles>
      <Text style={styles.positionLabel}>{label}</Text>
      <Text style={styles.resultCardName}>
        {card.name}
        {reversed ? ` · ${t("cardDraw.reversed")}` : ""}
      </Text>
      <Text style={styles.bodyText}>{meaningText}</Text>
    </GlassCard>
  );
}

type Props = {
  title: string;
  subtitle: string;
  placeholder?: string;
  context: string;
  onContextChange: (v: string) => void;
  allRevealed: boolean;
  onBack: () => void;
  children: React.ReactNode;
  results: SpreadResultEntry[];
  onNewSpread: () => void;
  hideInstruction?: boolean;
};

/** Shared chrome for every spread screen added after the first two (3-card,
 *  TarotSpreadScreen, and Celtic Cross, CelticCrossScreen — both predate
 *  this and keep their own copy of the same header/scroll/input/result-list
 *  structure, left as-is to avoid touching working screens). Each new
 *  screen only supplies its title/subtitle copy, its own custom slot grid
 *  as `children`, and the resolved list of {label, card, reversed} results;
 *  this handles the header, the correctly-padded ScrollView (+110 so
 *  content clears the floating tab bar these push screens sit behind), the
 *  question field, and the reveal → result-cards → "New spread" sequence. */
export function SpreadScreenLayout({
  title,
  subtitle,
  placeholder,
  context,
  onContextChange,
  allRevealed,
  onBack,
  children,
  results,
  onNewSpread,
  hideInstruction,
}: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();

  return (
    <ScreenBackground variant="night">
      <OrnateFrame />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 5l-7 7 7 7" stroke={colors.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{subtitle}</Text>

        <TextInput
          value={context}
          onChangeText={onContextChange}
          placeholder={placeholder ?? t("cardDraw.placeholder")}
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          editable={!allRevealed}
          multiline
        />

        {!hideInstruction && <Text style={styles.instruction}>{t("tarotSpreads.instruction")}</Text>}

        {children}

        {allRevealed && (
          <Animated.View entering={FadeInDown.duration(380)} style={{ marginTop: spacing.lg }}>
            {results.map((r) => (
              <ResultCard key={r.key} label={r.label} card={r.card} reversed={r.reversed} />
            ))}
            <GlowButton
              title={t("tarotSpreads.newSpread")}
              variant="outline"
              onPress={onNewSpread}
              style={{ marginTop: spacing.sm, alignSelf: "center" }}
            />
          </Animated.View>
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
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  subtitle: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 14, lineHeight: 20 },
  input: {
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
    backgroundColor: colors.bg2,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    color: colors.textPrimary,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    minHeight: 54,
    textAlignVertical: "top",
  },
  instruction: {
    color: colors.textTertiary,
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  resultCard: { marginBottom: spacing.sm },
  positionLabel: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  resultCardName: { color: colors.textPrimary, fontFamily: typography.h3.fontFamily, fontSize: 16.5, marginBottom: spacing.xs },
  bodyText: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 14, lineHeight: 20 },
});
