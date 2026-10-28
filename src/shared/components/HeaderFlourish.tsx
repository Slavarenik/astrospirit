import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, spacing } from "@shared/theme";

type Props = { align?: "left" | "center" };

/** Small ornamental divider — a thin gold hairline with a rotated diamond
 *  accent — used under screen headlines to echo the onboarding chrome's
 *  framed, line-art treatment without needing a full OrnateFrame. */
export function HeaderFlourish({ align = "left" }: Props) {
  return (
    <View style={[styles.row, align === "center" && styles.rowCenter]}>
      <View style={styles.line} />
      <View style={styles.dot} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginTop: spacing.xs, marginBottom: spacing.sm },
  rowCenter: { justifyContent: "center" },
  line: { width: 28, height: 1, backgroundColor: colors.goldLine },
  dot: {
    width: 5,
    height: 5,
    marginLeft: 7,
    backgroundColor: colors.gold,
    transform: [{ rotate: "45deg" }],
  },
});
