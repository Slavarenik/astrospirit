import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SpreadSlot } from "./SpreadSlot";
import { TarotCard } from "../data/tarotCatalog";
import { colors, typography } from "@shared/theme";

type Props = {
  width: number;
  height: number;
  card: TarotCard | null;
  reversed: boolean;
  onPress: () => void;
  label?: string;
  labelWidth?: number;
};

/** A SpreadSlot plus its small uppercase caption underneath — the same
 *  "slot + label" pairing every spread layout after Celtic Cross needs, so
 *  the per-screen grid code only has to say where each pair goes, not how
 *  to build one. */
export function LabeledSlot({ width, height, card, reversed, onPress, label, labelWidth }: Props) {
  return (
    <View style={styles.wrap}>
      <SpreadSlot width={width} height={height} card={card} reversed={reversed} onPress={onPress} />
      {label ? <Text style={[styles.label, { maxWidth: labelWidth ?? width + 10 }]}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 3 },
  label: {
    color: colors.textTertiary,
    fontFamily: typography.label.fontFamily,
    fontSize: 8.5,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    textAlign: "center",
  },
});
