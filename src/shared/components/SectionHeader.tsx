import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "@shared/theme";

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export function SectionHeader({ title, subtitle, right }: Props) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: typography.h3.fontFamily,
    fontSize: typography.h3.fontSize,
  },
  subtitle: {
    color: colors.textTertiary,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
});
