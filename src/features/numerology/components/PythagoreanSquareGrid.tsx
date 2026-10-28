import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors, spacing, typography } from "@shared/theme";
import { GlowButton } from "@shared/components";

const GRID_ORDER: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[][] = [
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],
];

function cellTone(count: number): { bg: string; fg: string } {
  if (count <= 0) return { bg: colors.bg2, fg: colors.textTertiary };
  if (count <= 2) return { bg: colors.accentSoft, fg: colors.textPrimary };
  if (count <= 4) return { bg: colors.goldLine, fg: colors.textOnAccent };
  return { bg: colors.gold, fg: colors.textOnAccent };
}

export type TraitRow = {
  key: string;
  title: string;
  levelLabel: string;
  description: string;
};

type Props = {
  counts: Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, number>;
  traits: TraitRow[];
  size?: number;
  /** When true, the grid itself still renders (it's a nice free teaser —
   *  it's just numbers) but the trait readings below it are replaced with
   *  a locked row, since those are the actual premium interpretation. */
  locked?: boolean;
  lockedLabel?: string;
  onUnlock?: () => void;
};

// Matches the outline GlowButton's own label color, since this only ever
// sits inside that variant here (same convention as AstroPassportCard).
function LockIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
      <Path d="M6 11V8a6 6 0 1112 0v3" stroke={colors.gold} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M5 11h14v9H5z" stroke={colors.gold} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

/** The classic 3x3 "quадрат Пифагора" digit-frequency grid — each cell
 *  shows a birth-date digit and how many times it occurred, shaded by
 *  count — plus the row/column/diagonal trait readings below it. */
export function PythagoreanSquareGrid({ counts, traits, size = 240, locked = false, lockedLabel, onUnlock }: Props) {
  const cell = (size - spacing.sm * 2) / 3;

  return (
    <View>
      <View style={[styles.grid, { width: size, height: size }]}>
        {GRID_ORDER.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {row.map((digit) => {
              const count = counts[digit];
              const tone = cellTone(count);
              return (
                <View key={digit} style={[styles.cell, { width: cell, height: cell, backgroundColor: tone.bg }]}>
                  <Text style={[styles.cellCount, { color: tone.fg }]}>{count > 0 ? String(digit).repeat(count) : "–"}</Text>
                  <Text style={[styles.cellDigit, { color: tone.fg }]}>{digit}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {locked ? (
        <GlowButton
          title={lockedLabel ?? ""}
          variant="outline"
          icon={<LockIcon />}
          onPress={onUnlock}
          style={{ marginTop: spacing.lg, alignSelf: "stretch" }}
        />
      ) : (
        <View style={styles.traitList}>
          {traits.map((t) => (
            <View key={t.key} style={styles.traitRow}>
              <View style={styles.traitHeadRow}>
                <Text style={styles.traitTitle}>{t.title}</Text>
                <Text style={styles.traitLevel}>{t.levelLabel}</Text>
              </View>
              <Text style={styles.traitText}>{t.description}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { alignSelf: "center" },
  row: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
  cell: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
  },
  cellCount: { fontFamily: typography.body.fontFamily, fontSize: 13, fontWeight: "700", letterSpacing: 1 },
  cellDigit: { fontFamily: typography.label.fontFamily, fontSize: 10, opacity: 0.7, marginTop: 2 },
  traitList: { gap: spacing.sm, marginTop: spacing.lg },
  traitRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    backgroundColor: colors.bg1,
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
  },
  traitHeadRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  traitTitle: { color: colors.textPrimary, fontFamily: typography.body.fontFamily, fontSize: 13.5, fontWeight: "600" },
  traitLevel: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
  traitText: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 12.5, marginTop: 4, lineHeight: 18 },
});
