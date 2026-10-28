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
import { SpreadSlot } from "../components/SpreadSlot";
import { CardFullScreenViewer } from "../components/CardFullScreenViewer";
import { useSpreadHistorySave } from "../hooks/useSpreadHistorySave";
import { MyDayStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<MyDayStackParamList, "CelticCross">;

// Index order doubles as reading order for the result list below — the
// classic sequence: the situation, what crosses it, its basis, what's
// recently passed, the aim, what's coming, then the four-card staff.
const POSITION_KEYS = [
  "present",
  "challenge",
  "foundation",
  "past",
  "crown",
  "future",
  "attitude",
  "external",
  "hopesFears",
  "outcome",
] as const;
type PositionKey = (typeof POSITION_KEYS)[number];
type Slot = { card: TarotCard | null; reversed: boolean };

const SLOT_COUNT = 10;
const SLOT_W = 56;
const SLOT_H = Math.round(SLOT_W * 1.62);

const EMPTY_SLOTS: Slot[] = Array.from({ length: SLOT_COUNT }, () => ({ card: null, reversed: false }));

// Labeled only on the four cross arms + the staff — the center pair
// (present/challenge) is one crossed stack, so it gets a single combined
// caption underneath instead of two overlapping labels.
const LABELED_INDEXES = new Set([2, 3, 4, 5, 6, 7, 8, 9]);

/** Stage 2 of the premium tarot-spreads feature: the classic 10-card
 *  Celtic Cross. Reuses the same SpreadSlot (flip-in-place) and
 *  pickRandomCards piece as the 3-card spread, just arranged into the
 *  traditional cross + 4-card staff layout instead of a single row. */
export function CelticCrossScreen({ navigation, route }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const [context, setContext] = useState(route.params?.context ?? "");
  const [pool, setPool] = useState<TarotCard[]>(() => pickRandomCards(SLOT_COUNT));
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
    setPool(pickRandomCards(SLOT_COUNT));
    setSlots(EMPTY_SLOTS);
    setViewerIndex(null);
  };

  useSpreadHistorySave(
    t("tarotSpreads.celticCross.title"),
    slots,
    POSITION_KEYS.map((k) => t(`tarotSpreads.positions.${k}`)),
    allRevealed,
    context
  );

  const slot = (index: number) => (
    <View style={styles.slotWrap}>
      <SpreadSlot width={SLOT_W} height={SLOT_H} card={slots[index].card} reversed={slots[index].reversed} onPress={() => handleSlotPress(index)} />
      {LABELED_INDEXES.has(index) && <Text style={styles.slotLabel}>{t(`tarotSpreads.positions.${POSITION_KEYS[index]}`)}</Text>}
    </View>
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
        <Text style={styles.headerTitle}>{t("tarotSpreads.celticCross.title")}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{t("tarotSpreads.celticCross.subtitle")}</Text>

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

        <View style={styles.spreadRow}>
          <View style={styles.crossCol}>
            <View style={styles.crossRow}>
              <View style={styles.spacer} />
              {slot(4) /* crown */}
              <View style={styles.spacer} />
            </View>
            <View style={styles.crossRow}>
              {slot(3) /* past */}
              <View style={styles.centerCell}>
                <SpreadSlot width={SLOT_W} height={SLOT_H} card={slots[0].card} reversed={slots[0].reversed} onPress={() => handleSlotPress(0)} />
                <View style={styles.challengeOverlay}>
                  <SpreadSlot width={SLOT_W} height={SLOT_H} card={slots[1].card} reversed={slots[1].reversed} onPress={() => handleSlotPress(1)} />
                </View>
              </View>
              {slot(5) /* future */}
            </View>
            <View style={styles.crossRow}>
              <View style={styles.spacer} />
              {slot(2) /* foundation */}
              <View style={styles.spacer} />
            </View>
            <Text style={styles.centerCaption}>
              {t("tarotSpreads.positions.present")} + {t("tarotSpreads.positions.challenge")}
            </Text>
          </View>

          <View style={styles.staffCol}>
            {slot(9) /* outcome */}
            {slot(8) /* hopesFears */}
            {slot(7) /* external */}
            {slot(6) /* attitude */}
          </View>
        </View>

        {allRevealed && (
          <Animated.View entering={FadeInDown.duration(380)} style={{ marginTop: spacing.lg }}>
            {slots.map(
              (s, i) =>
                s.card && <CelticResultCard key={`${s.card.id}-${i}`} position={POSITION_KEYS[i]} card={s.card} reversed={s.reversed} />
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

function CelticResultCard({ position, card, reversed }: { position: PositionKey; card: TarotCard; reversed: boolean }) {
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
    marginBottom: spacing.md,
    textAlign: "center",
  },
  spreadRow: { flexDirection: "row", justifyContent: "center", alignItems: "flex-start", gap: spacing.lg },
  crossCol: { alignItems: "center" },
  crossRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.xs },
  spacer: { width: SLOT_W },
  centerCell: { width: SLOT_W, height: SLOT_H, alignItems: "center", justifyContent: "center" },
  // zIndex pinned above the base Present slot underneath it — rendering
  // order alone put it on top in most cases, but platform-specific
  // stacking for absolute-positioned siblings (notably Android) could let
  // the un-rotated card poke out from behind the rotated one.
  challengeOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SLOT_W,
    height: SLOT_H,
    transform: [{ rotate: "90deg" }],
    zIndex: 2,
  },
  centerCaption: {
    color: colors.textTertiary,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
    textTransform: "uppercase",
    marginTop: spacing.xs,
  },
  staffCol: { gap: spacing.xs },
  slotWrap: { alignItems: "center", gap: 3 },
  slotLabel: {
    color: colors.textTertiary,
    fontFamily: typography.label.fontFamily,
    fontSize: 8.5,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    textAlign: "center",
    maxWidth: SLOT_W + 10,
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
