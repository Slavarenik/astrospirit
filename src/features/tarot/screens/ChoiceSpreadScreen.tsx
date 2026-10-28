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

type Props = NativeStackScreenProps<MyDayStackParamList, "ChoiceSpread">;

// Index 0 is the shared situation card; 1–2 trace path A's unfolding and
// outcome, 3–4 trace path B's — also the reading order below.
const POSITION_KEYS = ["situation", "optionADevelopment", "optionAOutcome", "optionBDevelopment", "optionBOutcome"] as const;

const SLOT_W = 60;
const SLOT_H = Math.round(SLOT_W * 1.62);

/** "Выбор" (Choice): a 5-card spread for deciding between two paths, A
 *  and B — one shared situation card up top, then each path's own two-card
 *  column (how it unfolds, where it ends up) laid out side by side below. */
export function ChoiceSpreadScreen({ navigation, route }: Props) {
  const t = useT();
  const [context, setContext] = useState(route.params?.context ?? "");
  const { slots, allRevealed, handleSlotPress, handleNewSpread, viewerIndex, closeViewer } = useSpreadDraw(5);

  const label = (key: (typeof POSITION_KEYS)[number]) => t(`tarotSpreads.choice.positions.${key}`);

  const results: SpreadResultEntry[] = slots
    .map((s, i) => (s.card ? { key: `${s.card.id}-${i}`, label: label(POSITION_KEYS[i]), card: s.card as TarotCard, reversed: s.reversed } : null))
    .filter((r): r is SpreadResultEntry => r !== null);

  useSpreadHistorySave(t("tarotSpreads.choice.title"), slots, POSITION_KEYS.map(label), allRevealed, context);

  return (
    <>
      <SpreadScreenLayout
        title={t("tarotSpreads.choice.title")}
        subtitle={t("tarotSpreads.choice.subtitle")}
        context={context}
        onContextChange={setContext}
        allRevealed={allRevealed}
        onBack={() => navigation.goBack()}
        results={results}
        onNewSpread={handleNewSpread}
      >
        <View style={styles.wrap}>
          <LabeledSlot
            width={SLOT_W}
            height={SLOT_H}
            card={slots[0].card}
            reversed={slots[0].reversed}
            onPress={() => handleSlotPress(0)}
            label={label("situation")}
          />
          <View style={styles.pathsRow}>
            <View style={styles.pathCol}>
              <LabeledSlot width={SLOT_W} height={SLOT_H} card={slots[1].card} reversed={slots[1].reversed} onPress={() => handleSlotPress(1)} label={label("optionADevelopment")} />
              <LabeledSlot width={SLOT_W} height={SLOT_H} card={slots[2].card} reversed={slots[2].reversed} onPress={() => handleSlotPress(2)} label={label("optionAOutcome")} />
            </View>
            <View style={styles.pathCol}>
              <LabeledSlot width={SLOT_W} height={SLOT_H} card={slots[3].card} reversed={slots[3].reversed} onPress={() => handleSlotPress(3)} label={label("optionBDevelopment")} />
              <LabeledSlot width={SLOT_W} height={SLOT_H} card={slots[4].card} reversed={slots[4].reversed} onPress={() => handleSlotPress(4)} label={label("optionBOutcome")} />
            </View>
          </View>
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
  pathsRow: { flexDirection: "row", gap: spacing.xl },
  pathCol: { alignItems: "center", gap: spacing.sm },
});
