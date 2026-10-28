import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useT } from "@shared/i18n";
import { spacing } from "@shared/theme";
import { TarotCard } from "../data/tarotCatalog";
import { LabeledSlot } from "../components/LabeledSlot";
import { CardFullScreenViewer } from "../components/CardFullScreenViewer";
import { SpreadScreenLayout, SpreadResultEntry } from "../components/SpreadScreenLayout";
import { useSpreadDraw } from "../hooks/useSpreadDraw";
import { useSpreadHistorySave } from "../hooks/useSpreadHistorySave";
import { MyDayStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<MyDayStackParamList, "CrossSpread">;

// Index order: the shape is a plain 4-point cross (no center card) —
// issue on top, helps/hinders as the left/right arms, outcome on the
// bottom, which is also the reading order below once revealed.
const POSITION_KEYS = ["issue", "helps", "hinders", "outcome"] as const;

const SLOT_W = 68;
const SLOT_H = Math.round(SLOT_W * 1.62);

/** "Крест" (Cross): a compact 4-card spread for one specific problem —
 *  its essence, what's helping, what's working against it, and where it's
 *  heading. Laid out as a diamond so the shape itself reads as a cross. */
export function CrossSpreadScreen({ navigation, route }: Props) {
  const t = useT();
  const [context, setContext] = useState(route.params?.context ?? "");
  const { slots, allRevealed, handleSlotPress, handleNewSpread, viewerIndex, closeViewer } = useSpreadDraw(4);

  const label = (key: (typeof POSITION_KEYS)[number]) => t(`tarotSpreads.cross.positions.${key}`);

  const results: SpreadResultEntry[] = slots
    .map((s, i) => (s.card ? { key: `${s.card.id}-${i}`, label: label(POSITION_KEYS[i]), card: s.card as TarotCard, reversed: s.reversed } : null))
    .filter((r): r is SpreadResultEntry => r !== null);

  useSpreadHistorySave(t("tarotSpreads.cross.title"), slots, POSITION_KEYS.map(label), allRevealed, context);

  return (
    <>
      <SpreadScreenLayout
        title={t("tarotSpreads.cross.title")}
        subtitle={t("tarotSpreads.cross.subtitle")}
        context={context}
        onContextChange={setContext}
        allRevealed={allRevealed}
        onBack={() => navigation.goBack()}
        results={results}
        onNewSpread={handleNewSpread}
      >
        <View style={styles.diamond}>
          <LabeledSlot width={SLOT_W} height={SLOT_H} card={slots[0].card} reversed={slots[0].reversed} onPress={() => handleSlotPress(0)} label={label("issue")} />
          <View style={styles.midRow}>
            <LabeledSlot width={SLOT_W} height={SLOT_H} card={slots[1].card} reversed={slots[1].reversed} onPress={() => handleSlotPress(1)} label={label("helps")} />
            <LabeledSlot width={SLOT_W} height={SLOT_H} card={slots[2].card} reversed={slots[2].reversed} onPress={() => handleSlotPress(2)} label={label("hinders")} />
          </View>
          <LabeledSlot width={SLOT_W} height={SLOT_H} card={slots[3].card} reversed={slots[3].reversed} onPress={() => handleSlotPress(3)} label={label("outcome")} />
        </View>
      </SpreadScreenLayout>
      <CardFullScreenViewer
        card={viewerIndex !== null ? slots[viewerIndex].card : null}
        reversed={viewerIndex !== null ? slots[viewerIndex].reversed : false}
        label={viewerIndex !== null ? label(POSITION_KEYS[viewerIndex]) : ""}
        onClose={closeViewer}
      />
    </>
  );
}

const styles = StyleSheet.create({
  diamond: { alignItems: "center", gap: spacing.sm },
  midRow: { flexDirection: "row", gap: spacing.lg },
});
