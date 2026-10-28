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

type Props = NativeStackScreenProps<MyDayStackParamList, "Horseshoe">;

// Reading order left to right is also the classic horseshoe sequence.
const POSITION_KEYS = ["past", "present", "hidden", "obstacles", "external", "advice", "outcome"] as const;

const SLOT_W = 42;
const SLOT_H = Math.round(SLOT_W * 1.62);

// A vertical offset per column, highest in the middle and lowest at the
// ends — seven cards in a row read as an upward arc (a horseshoe standing
// on its two ends) without needing true curved/trig positioning.
const ARC_OFFSETS = [36, 22, 10, 0, 10, 22, 36];

/** "Подкова" (Horseshoe): a 7-card spread for a fuller read on a
 *  situation — past, present, hidden influences, obstacles, outside
 *  circumstances, advice, and where it's heading — arranged in the
 *  arc the spread is named for. */
export function HorseshoeScreen({ navigation, route }: Props) {
  const t = useT();
  const [context, setContext] = useState(route.params?.context ?? "");
  const { slots, allRevealed, handleSlotPress, handleNewSpread, viewerIndex, closeViewer } = useSpreadDraw(7);

  const label = (key: (typeof POSITION_KEYS)[number]) => t(`tarotSpreads.horseshoe.positions.${key}`);

  const results: SpreadResultEntry[] = slots
    .map((s, i) => (s.card ? { key: `${s.card.id}-${i}`, label: label(POSITION_KEYS[i]), card: s.card as TarotCard, reversed: s.reversed } : null))
    .filter((r): r is SpreadResultEntry => r !== null);

  useSpreadHistorySave(t("tarotSpreads.horseshoe.title"), slots, POSITION_KEYS.map(label), allRevealed, context);

  return (
    <>
      <SpreadScreenLayout
        title={t("tarotSpreads.horseshoe.title")}
        subtitle={t("tarotSpreads.horseshoe.subtitle")}
        context={context}
        onContextChange={setContext}
        allRevealed={allRevealed}
        onBack={() => navigation.goBack()}
        results={results}
        onNewSpread={handleNewSpread}
      >
        <View style={styles.arcRow}>
          {POSITION_KEYS.map((key, i) => (
            <View key={key} style={{ marginTop: ARC_OFFSETS[i] }}>
              <LabeledSlot
                width={SLOT_W}
                height={SLOT_H}
                card={slots[i].card}
                reversed={slots[i].reversed}
                onPress={() => handleSlotPress(i)}
                label={label(key)}
                labelWidth={SLOT_W + 8}
              />
            </View>
          ))}
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
  arcRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "center", gap: spacing.xxs },
});
