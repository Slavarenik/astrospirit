import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { ScreenBackground, GlassCard, OrnateFrame, GlowButton } from "@shared/components";
import { colors, radius, spacing, typography } from "@shared/theme";
import { useT, useTranslatedTexts } from "@shared/i18n";
import { pickRandomCards, TarotCard } from "../data/tarotCatalog";
import { CARD_W, CARD_H } from "../components/CardPickGrid";
import { SpreadSlot } from "../components/SpreadSlot";
import { CardFullScreenViewer } from "../components/CardFullScreenViewer";
import { useSpreadHistorySave } from "../hooks/useSpreadHistorySave";
import { MyDayStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<MyDayStackParamList, "TarotSpread">;

const POSITION_KEYS = ["past", "present", "future"] as const;
type PositionKey = (typeof POSITION_KEYS)[number];
type Slot = { card: TarotCard | null; reversed: boolean };

const EMPTY_SLOTS: Slot[] = [
  { card: null, reversed: false },
  { card: null, reversed: false },
  { card: null, reversed: false },
];

/** Stage 1 of the premium tarot-spreads feature: a fixed 3-position
 *  Past/Present/Future spread. Each position is its own face-down slot
 *  (SpreadSlot) that flips in place when tapped, in any order — unlike the
 *  single "card of the day" draw (CardDrawScreen), there's no pick-from-a-
 *  grid-of-12 step, since the position is already fixed by its slot. */
export function TarotSpreadScreen({ navigation, route }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const [context, setContext] = useState(route.params?.context ?? "");
  const [pool, setPool] = useState<TarotCard[]>(() => pickRandomCards(3));
  const [slots, setSlots] = useState<Slot[]>(EMPTY_SLOTS);
  // Which slot is open in the full-screen viewer, if any — tapping an
  // already-revealed slot a second time opens it instead of doing nothing.
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const allRevealed = slots.every((s) => s.card !== null);

  const handlePick = (index: number) => {
    if (slots[index].card) return;
    const card = pool[index];
    const reversed = Math.random() < 0.25;
    setSlots((cur) => cur.map((s, i) => (i === index ? { card, reversed } : s)));
  };

  const handleSlotPress = (index: number) => {
    if (slots[index].card) {
      setViewerIndex(index);
    } else {
      handlePick(index);
    }
  };

  const handleNewSpread = () => {
    setPool(pickRandomCards(3));
    setSlots(EMPTY_SLOTS);
    setViewerIndex(null);
  };

  useSpreadHistorySave(
    t("tarotSpreads.threeCard.title"),
    slots,
    POSITION_KEYS.map((k) => t(`tarotSpreads.positions.${k}`)),
    allRevealed,
    context
  );

  return (
    <>
    <ScreenBackground variant="night">
      <OrnateFrame />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 5l-7 7 7 7" stroke={colors.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>{t("tarotSpreads.threeCard.title")}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{t("tarotSpreads.threeCard.subtitle")}</Text>

        <TextInput
          value={context}
          onChangeText={setContext}
          placeholder={t("cardDraw.placeholder")}
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          editable={!allRevealed}
          multiline
        />

        <Text style={styles.instruction}>{t("tarotSpreads.instruction")}</Text>

        <View style={styles.slotsRow}>
          {slots.map((slot, i) => (
            <View key={i} style={styles.slotCol}>
              <SpreadSlot width={CARD_W} height={CARD_H} card={slot.card} reversed={slot.reversed} onPress={() => handleSlotPress(i)} />
              <Text style={styles.slotLabel}>{t(`tarotSpreads.positions.${POSITION_KEYS[i]}`)}</Text>
            </View>
          ))}
        </View>

        {allRevealed && (
          <Animated.View entering={FadeInDown.duration(380)} style={{ marginTop: spacing.lg }}>
            {slots.map(
              (slot, i) =>
                slot.card && (
                  <SpreadResultCard
                    key={`${slot.card.id}-${i}`}
                    position={POSITION_KEYS[i]}
                    card={slot.card}
                    reversed={slot.reversed}
                  />
                )
            )}

            <GlowButton
              title={t("tarotSpreads.newSpread")}
              variant="outline"
              onPress={handleNewSpread}
              style={{ marginTop: spacing.sm, alignSelf: "center" }}
            />
          </Animated.View>
        )}
      </ScrollView>
    </ScreenBackground>
    <CardFullScreenViewer
      card={viewerIndex !== null ? slots[viewerIndex].card : null}
      reversed={viewerIndex !== null ? slots[viewerIndex].reversed : false}
      label={viewerIndex !== null ? t(`tarotSpreads.positions.${POSITION_KEYS[viewerIndex]}`) : ""}
      onClose={() => setViewerIndex(null)}
    />
    </>
  );
}

function SpreadResultCard({
  position,
  card,
  reversed,
}: {
  position: PositionKey;
  card: TarotCard;
  reversed: boolean;
}) {
  const t = useT();
  const meaning = reversed ? card.meaning.reversed : card.meaning.upright;
  const { texts } = useTranslatedTexts([meaning]);
  const meaningText = texts[0] ?? meaning;

  return (
    <GlassCard style={styles.resultCard} sparkles>
      <Text style={styles.positionLabel}>{t(`tarotSpreads.positions.${position}`)}</Text>
      <Text style={styles.resultCardName}>
        {card.name}
        {reversed ? ` · ${t("cardDraw.reversed")}` : ""}
      </Text>
      <Text style={styles.bodyText}>{meaningText}</Text>
    </GlassCard>
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
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  slotsRow: { flexDirection: "row", justifyContent: "space-between" },
  slotCol: { alignItems: "center", gap: spacing.xs },
  slotLabel: {
    color: colors.textTertiary,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
    textTransform: "uppercase",
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
