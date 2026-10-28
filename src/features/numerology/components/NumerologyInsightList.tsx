import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "@shared/theme";

export type InsightItem = { key: string; label: string; text: string };

type Props = { items: InsightItem[] };

/** A plain label+paragraph list — the shared shape for every numerology
 *  section that reads more like a short list of insights than a set of
 *  numbers with their own wheel (career/finance, karmic lessons, life
 *  stages). Mirrors PythagoreanSquareGrid's trait-row styling so every
 *  section of the screen stays visually consistent. */
export function NumerologyInsightList({ items }: Props) {
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item.key} style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.text}>{item.text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    backgroundColor: colors.bg1,
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
  },
  label: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
  text: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 12.5, marginTop: 4, lineHeight: 18 },
});
