import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GlassCard, FadeInUp } from "@shared/components";
import { colors, spacing, typography } from "@shared/theme";

type Props = {
  eyebrow: string;
  title: string;
  number: number;
  isMaster: boolean;
  masterLabel: string;
  description: string;
  delay?: number;
};

/** A single Life Path Number card (Consciousness or Mission) — the big
 *  reduced digit as a badge, with its interpretive text below, in the same
 *  glass-card language as AstroPassportCard's planet rows. */
export function NumerologyNumberCard({ eyebrow, title, number, isMaster, masterLabel, description, delay }: Props) {
  return (
    <FadeInUp delay={delay}>
      <GlassCard glow sparkles style={styles.card}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <View style={styles.headRow}>
          <View style={[styles.badge, isMaster && styles.badgeMaster]}>
            <Text style={[styles.badgeNumber, isMaster && styles.badgeNumberMaster]}>{number}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{title}</Text>
            {isMaster ? <Text style={styles.masterTag}>{masterLabel}</Text> : null}
          </View>
        </View>
        <Text style={styles.description}>{description}</Text>
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
    marginBottom: spacing.sm,
  },
  headRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  badge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.goldLine,
  },
  badgeMaster: { backgroundColor: colors.gold, borderColor: colors.gold },
  badgeNumber: { color: colors.accent, fontFamily: typography.h1.fontFamily, fontSize: 22, fontWeight: "700" },
  badgeNumberMaster: { color: colors.bg1 },
  title: { color: colors.textPrimary, fontFamily: typography.h1.fontFamily, fontSize: 18 },
  masterTag: {
    color: colors.gold,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
    marginTop: 2,
  },
  description: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
});
