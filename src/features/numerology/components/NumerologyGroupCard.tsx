import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GlassCard, FadeInUp } from "@shared/components";
import { colors, spacing, typography } from "@shared/theme";
import { NumberWheel, WheelPoint } from "./NumberWheel";
import { isMasterNumber } from "@shared/utils/numerology";

export type NumerologyRow = {
  key: string;
  label: string;
  number: number;
  color: string;
  description: string;
};

type Props = {
  eyebrow: string;
  title: string;
  rows: NumerologyRow[];
  masterLabel: string;
  delay?: number;
  footer?: React.ReactNode;
};

/** A wheel highlighting every number in `rows`, plus the same badge+title+
 *  text row layout AstroPassportCard uses for sun/moon/rising — one card
 *  per "family" of numbers (by birth date, or by name) instead of one
 *  card per number, so the screen doesn't repeat itself six times over. */
export function NumerologyGroupCard({ eyebrow, title, rows, masterLabel, delay, footer }: Props) {
  const points: WheelPoint[] = rows.map((r) => ({ value: r.number, label: r.label, color: r.color }));

  return (
    <FadeInUp delay={delay}>
      <GlassCard glow sparkles style={styles.card}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.wheelRow}>
          <NumberWheel points={points} size={200} />
        </View>

        <View style={styles.rows}>
          {rows.map((r) => (
            <View key={r.key} style={styles.row}>
              <View style={[styles.badge, { borderColor: r.color }]}>
                <Text style={[styles.badgeNumber, { color: r.color }]}>{r.number}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.rowTitleWrap}>
                  <Text style={styles.rowTitle}>{r.label}</Text>
                  {isMasterNumber(r.number) ? <Text style={styles.masterTag}>{masterLabel}</Text> : null}
                </View>
                <Text style={styles.rowText}>{r.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </GlassCard>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  eyebrow: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
  title: { color: colors.textPrimary, fontFamily: typography.h1.fontFamily, fontSize: 20, marginTop: 2 },
  wheelRow: { alignItems: "center", marginVertical: spacing.lg },
  rows: { gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bg1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  badgeNumber: { fontSize: 14, fontWeight: "700" },
  rowTitleWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowTitle: { color: colors.textPrimary, fontFamily: typography.body.fontFamily, fontSize: 14.5, fontWeight: "600" },
  masterTag: {
    color: colors.gold,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
  rowText: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 13, marginTop: 2, lineHeight: 19 },
  footer: { marginTop: spacing.md },
});
