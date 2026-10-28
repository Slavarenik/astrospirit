import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { colors, radius, spacing, shadow } from "@shared/theme";
import { CornerSparkle } from "./CornerSparkle";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  glow?: boolean;
  sparkles?: boolean;
};

/** Flat ornamental card surface — solid charcoal fill, thin gold hairline
 *  border, generously rounded corners. Matches the reference's
 *  "compatibility characteristic" card treatment. Set `sparkles` to add
 *  the small gold star accents in two corners. */
export function GlassCard({ children, style, padded = true, glow = false, sparkles = false }: Props) {
  return (
    <View style={[styles.wrap, glow && shadow.soft, style]}>
      <View style={padded ? styles.padded : undefined}>{children}</View>
      {sparkles && (
        <>
          <View style={styles.sparkleTL}>
            <CornerSparkle size={11} color={colors.gold} opacity={0.7} />
          </View>
          <View style={styles.sparkleBR}>
            <CornerSparkle size={11} color={colors.gold} opacity={0.7} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
    overflow: "visible",
  },
  padded: { padding: spacing.lg },
  sparkleTL: { position: "absolute", top: 10, left: 10 },
  sparkleBR: { position: "absolute", bottom: 10, right: 10 },
});
