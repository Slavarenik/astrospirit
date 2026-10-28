import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { ScreenBackground, GlassCard, OrnateFrame } from "@shared/components";
import { colors, radius, spacing, typography } from "@shared/theme";
import { useT, useTranslatedTexts } from "@shared/i18n";
import { ALL_CARDS, pickRandomCard, TarotCard, getCardById } from "../data/tarotCatalog";
import { CARD_IMAGES } from "../data/cardImages";
import { CardPickGrid, CARD_W, CARD_H } from "../components/CardPickGrid";
import { DrawnCardReveal } from "../components/DrawnCardReveal";
import { useCardOfDayStore, todayKey } from "@shared/storage/useCardOfDayStore";
import { MyDayStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<MyDayStackParamList, "CardDraw">;

const GRID_COUNT = 12;

export function CardDrawScreen({ navigation, route }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const drawn = useCardOfDayStore((s) => s.drawn);
  const setDrawn = useCardOfDayStore((s) => s.setDrawn);
  const alreadyDrawnToday = drawn?.dateKey === todayKey();

  const [context, setContext] = useState(route.params?.context ?? "");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [docked, setDocked] = useState(alreadyDrawnToday);
  const [revealedCard, setRevealedCard] = useState<TarotCard | null>(
    alreadyDrawnToday && drawn ? getCardById(drawn.cardId) ?? null : null
  );
  const [reversed, setReversed] = useState(alreadyDrawnToday ? !!drawn?.reversed : false);

  // Secretly shuffle a pool so each face-down slot maps to a real card.
  const pool = useMemo(() => {
    const shuffled = [...ALL_CARDS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, GRID_COUNT);
  }, []);

  const handlePick = (index: number) => {
    if (selectedIndex !== null) return;
    const card = pool[index] ?? pickRandomCard();
    const isReversed = Math.random() < 0.25;
    setSelectedIndex(index);
    setRevealedCard(card);
    setReversed(isReversed);
  };

  const handleDocked = () => {
    setDocked(true);
    if (revealedCard) {
      setDrawn({ dateKey: todayKey(), cardId: revealedCard.id, reversed });
    }
  };

  const showGrid = !docked && !alreadyDrawnToday;
  const showAnimation = selectedIndex !== null && !docked;
  const showResult = docked && !!revealedCard;

  return (
    <ScreenBackground variant="night">
      <OrnateFrame />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 5l-7 7 7 7" stroke={colors.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>{t("cardOfDay.title")}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {showResult && revealedCard && (
          <Animated.View entering={FadeIn.delay(80).duration(400)} style={styles.dockedSlot}>
            <View style={styles.dockedCardWrap}>
              <ResultImage card={revealedCard} reversed={reversed} />
            </View>
          </Animated.View>
        )}

        {showResult && revealedCard ? (
          <Animated.View entering={FadeInDown.delay(180).duration(420)}>
            <ResultPanel card={revealedCard} reversed={reversed} context={context} />
          </Animated.View>
        ) : (
          <>
            <Text style={styles.prompt}>{t("cardDraw.prompt")}</Text>
            <TextInput
              value={context}
              onChangeText={setContext}
              placeholder={t("cardDraw.placeholder")}
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
              editable={selectedIndex === null}
              multiline
            />

            {showGrid && (
              <Animated.View entering={FadeIn.duration(300)} style={{ marginTop: spacing.lg }}>
                <Text style={styles.instruction}>{t("cardDraw.instruction")}</Text>
                <CardPickGrid count={GRID_COUNT} disabled={selectedIndex !== null} selectedIndex={selectedIndex} onPick={handlePick} />
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>

      {showAnimation && revealedCard && (
        <DrawnCardReveal card={revealedCard} reversed={reversed} onDocked={handleDocked} />
      )}
    </ScreenBackground>
  );
}

function ResultImage({ card, reversed }: { card: TarotCard; reversed: boolean }) {
  return (
    <View style={[styles.resultImageWrap, { width: CARD_W * 1.15, height: CARD_H * 1.15 }]}>
      <Animated.Image
        source={CARD_IMAGES[card.id]}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: radius.sm,
          transform: reversed ? [{ rotate: "180deg" }] : undefined,
        }}
        resizeMode="cover"
      />
    </View>
  );
}

function ResultPanel({ card, reversed, context }: { card: TarotCard; reversed: boolean; context: string }) {
  const t = useT();
  const meaning = reversed ? card.meaning.reversed : card.meaning.upright;
  const source = [...card.meaning.keywords, meaning, card.meaning.psychological];
  const { texts } = useTranslatedTexts(source);
  const keywords = texts.slice(0, card.meaning.keywords.length);
  const meaningText = texts[card.meaning.keywords.length] ?? meaning;
  const psychText = texts[card.meaning.keywords.length + 1] ?? card.meaning.psychological;
  const deeperLabel = context.trim()
    ? t("cardDraw.deeperReadOn").replace("{{q}}", context.trim())
    : t("cardDraw.deeperRead");

  return (
    <View style={{ marginTop: spacing.lg }}>
      <Text style={styles.cardNameLarge}>
        {card.name}
        {reversed ? ` · ${t("cardDraw.reversed")}` : ""}
      </Text>
      <View style={styles.keywordRow}>
        {keywords.map((k, i) => (
          <View key={`${card.meaning.keywords[i]}-${i}`} style={styles.keywordChip}>
            <Text style={styles.keywordText}>{k}</Text>
          </View>
        ))}
      </View>

      <GlassCard style={{ marginTop: spacing.md }} sparkles>
        <Text style={styles.sectionLabel}>{t("cardDraw.meaning")}</Text>
        <Text style={styles.bodyText}>{meaningText}</Text>
      </GlassCard>

      <GlassCard style={{ marginTop: spacing.sm }}>
        <Text style={styles.sectionLabel}>{deeperLabel}</Text>
        <Text style={styles.bodyText}>{psychText}</Text>
      </GlassCard>
    </View>
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
  prompt: { color: colors.textPrimary, fontFamily: typography.h2.fontFamily, fontSize: 20, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
    backgroundColor: colors.bg2,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    minHeight: 54,
    textAlignVertical: "top",
  },
  instruction: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  dockedSlot: { alignItems: "center", marginBottom: spacing.sm },
  dockedCardWrap: { alignItems: "center" },
  resultImageWrap: { borderRadius: radius.sm, overflow: "hidden", borderWidth: 1, borderColor: colors.goldLine },
  cardNameLarge: {
    color: colors.textPrimary,
    fontFamily: typography.h1.fontFamily,
    fontSize: 24,
    textAlign: "center",
  },
  keywordRow: { flexDirection: "row", justifyContent: "center", gap: spacing.xs, marginTop: spacing.sm, flexWrap: "wrap" },
  keywordChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.goldLine,
  },
  keywordText: { color: colors.accent, fontSize: 11.5, fontFamily: typography.label.fontFamily },
  sectionLabel: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  bodyText: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 14.5, lineHeight: 22 },
});
