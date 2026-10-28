import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { colors, radius, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { PaywallPlan } from "../data/plans";

type Props = {
  plan: PaywallPlan;
  selected: boolean;
  onPress: () => void;
};

/** One selectable pricing tier. Price/breakdown/savings come from the live
 *  RevenueCat package attached in `mergeLiveOffering`. */
export function PlanCard({ plan, selected, onPress }: Props) {
  const t = useT();
  const badge = plan.highlight ? t(`paywall.plans.${plan.highlight}Badge`) : null;

  return (
    <Pressable onPress={onPress} style={[styles.card, selected && styles.cardSelected]}>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <View style={styles.row}>
        <View style={[styles.radio, selected && styles.radioSelected]}>{selected && <View style={styles.radioDot} />}</View>
        <View style={styles.labelCol}>
          <Text style={styles.label}>{t(`paywall.plans.${plan.id}.label`)}</Text>
          {plan.priceBreakdown && <Text style={styles.breakdown}>{plan.priceBreakdown}</Text>}
        </View>
        <View style={styles.priceCol}>
          <Text style={[styles.price, !plan.price && styles.priceTbd]}>{plan.price ?? t("paywall.priceTBD")}</Text>
          {plan.price && <Text style={styles.period}>{t(`paywall.plans.${plan.id}.period`)}</Text>}
          {!!plan.savePercent && (
            <View style={styles.saveChip}>
              <Text style={styles.saveChipText}>{t("paywall.plans.save").replace("{{percent}}", String(plan.savePercent))}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
    backgroundColor: colors.bg2,
    padding: spacing.md,
    position: "relative",
  },
  cardSelected: { borderColor: colors.gold, backgroundColor: colors.bg3 },
  badge: {
    position: "absolute",
    top: -10,
    left: spacing.md,
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeText: {
    color: colors.textOnAccent,
    fontFamily: typography.label.fontFamily,
    fontSize: 9.5,
    letterSpacing: 1.2,
    fontWeight: "700",
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.6,
    borderColor: colors.goldLineStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: colors.gold },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gold },
  labelCol: { flex: 1 },
  label: { color: colors.textPrimary, fontFamily: typography.bodyLg.fontFamily, fontSize: 15.5, fontWeight: "600" },
  breakdown: { color: colors.textTertiary, fontFamily: typography.caption.fontFamily, fontSize: 11.5, marginTop: 2 },
  priceCol: { alignItems: "flex-end" },
  price: { color: colors.gold, fontFamily: typography.h3.fontFamily, fontSize: 17 },
  priceTbd: { color: colors.textTertiary, fontSize: 13, fontFamily: typography.body.fontFamily },
  period: { color: colors.textTertiary, fontFamily: typography.caption.fontFamily, fontSize: 11 },
  saveChip: {
    marginTop: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
  },
  saveChipText: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: 9.5,
    letterSpacing: 0.4,
    fontWeight: "700",
  },
});
