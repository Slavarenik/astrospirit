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

type Props = NativeStackScreenProps<MyDayStackParamList, "StationForTwo">;

// Two mirrored 3-card columns (each partner's thoughts, feelings, outward
// behavior toward the other) plus a shared outcome card — also the
// reading order below once revealed.
const POSITION_KEYS = ["aThoughts", "aFeelings", "aBehavior", "bThoughts", "bFeelings", "bBehavior", "outcome"] as const;

const SLOT_W = 54;
const SLOT_H = Math.round(SLOT_W * 1.62);

/** "Вокзал для двоих" (Station for Two): the most popular relationship
 *  spread — each partner's own column of thoughts, feelings, and outward
 *  behavior toward the other, facing each other, with a shared outcome
 *  card below standing in for where it's heading together. */
export function StationForTwoScreen({ navigation, route }: Props) {
  const t = useT();
  const [context, setContext] = useState(route.params?.context ?? "");
  const { slots, allRevealed, handleSlotPress, handleNewSpread, viewerIndex, closeViewer } = useSpreadDraw(7);

  const label = (key: (typeof POSITION_KEYS)[number]) => t(`tarotSpreads.stationForTwo.positions.${key}`);

  const results: SpreadResultEntry[] = slots
    .map((s, i) => (s.card ? { key: `${s.card.id}-${i}`, label: label(POSITION_KEYS[i]), card: s.card as TarotCard, reversed: s.reversed } : null))
    .filter((r): r is SpreadResultEntry => r !== null);

  useSpreadHistorySave(t("tarotSpreads.stationForTwo.title"), slots, POSITION_KEYS.map(label), allRevealed, context);

  return (
    <>
      <SpreadScreenLayout
        title={t("tarotSpreads.stationForTwo.title")}
        subtitle={t("tarotSpreads.stationForTwo.subtitle")}
        context={context}
        onContextChange={setContext}
        allRevealed={allRevealed}
        onBack={() => navigation.goBack()}
        results={results}
        onNewSpread={handleNewSpread}
      >
        <View style={styles.wrap}>
          <View style={styles.partnersRow}>
            <View style={styles.col}>
              <LabeledSlot width={SLOT_W} height={SLOT_H} card={slots[0].card} reversed={slots[0].reversed} onPress={() => handleSlotPress(0)} label={label("aThoughts")} />
              <LabeledSlot width={SLOT_W} height={SLOT_H} card={slots[1].card} reversed={slots[1].reversed} onPress={() => handleSlotPress(1)} label={label("aFeelings")} />
              <LabeledSlot width={SLOT_W} height={SLOT_H} card={slots[2].card} reversed={slots[2].reversed} onPress={() => handleSlotPress(2)} label={label("aBehavior")} />
            </View>
            <View style={styles.col}>
              <LabeledSlot width={SLOT_W} height={SLOT_H} card={slots[3].card} reversed={slots[3].reversed} onPress={() => handleSlotPress(3)} label={label("bThoughts")} />
              <LabeledSlot width={SLOT_W} height={SLOT_H} card={slots[4].card} reversed={slots[4].reversed} onPress={() => handleSlotPress(4)} label={label("bFeelings")} />
              <LabeledSlot width={SLOT_W} height={SLOT_H} card={slots[5].card} reversed={slots[5].reversed} onPress={() => handleSlotPress(5)} label={label("bBehavior")} />
            </View>
          </View>
          <LabeledSlot
            width={SLOT_W}
            height={SLOT_H}
            card={slots[6].card}
            reversed={slots[6].reversed}
            onPress={() => handleSlotPress(6)}
            label={label("outcome")}
          />
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
  wrap: { alignItems: "center", gap: spacing.md },
  partnersRow: { flexDirection: "row", gap: spacing.xl },
  col: { alignItems: "center", gap: spacing.sm },
});
