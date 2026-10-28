import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { GlassCard, FadeInUp, GlowButton } from "@shared/components";
import { colors, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { usePremiumStore } from "@shared/storage/usePremiumStore";
import { usePaywallNavigation } from "@shared/hooks/usePaywallNavigation";

function CrownIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 18h18l-1.6-8-4.2 3.2L12 6.5 9.8 13.2 5.6 10 4 18z"
        stroke={colors.gold}
        strokeWidth={1.6}
        strokeLinejoin="round"
        fill={colors.goldSoft}
      />
    </Svg>
  );
}

function ChevronIcon() {
  return (
    <Svg width={9} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M9 5l7 7-7 7" stroke={colors.textTertiary} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Entry point into the Paywall from Profile — a short CTA card when the
 *  person isn't premium yet, or (once they are) a tappable row that opens
 *  the paywall's management view — switch plan, restore, cancel. */
export function PremiumBanner() {
  const t = useT();
  const isPremium = usePremiumStore((s) => s.isPremium);
  const goToPaywall = usePaywallNavigation();

  // The whole row is always tappable: when already Premium it opens the
  // paywall's management view (switch plan / restore / cancel); otherwise
  // it opens the same screen's upsell view. (goToPaywall is one function —
  // PaywallScreen itself branches on isPremium.)
  return (
    <FadeInUp delay={100}>
      <GlassCard sparkles glow style={styles.card}>
        <Pressable style={styles.row} onPress={goToPaywall}>
          <View style={styles.iconWrap}>
            <CrownIcon />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.title}>{isPremium ? t("profile.premiumActive.title") : t("profile.premiumBanner.title")}</Text>
            <Text style={styles.subtitle}>
              {isPremium ? t("profile.premiumActive.subtitle") : t("profile.premiumBanner.subtitle")}
            </Text>
          </View>
          {!isPremium && (
            <GlowButton title={t("profile.premiumBanner.cta")} variant="outline" onPress={goToPaywall} style={styles.cta} />
          )}
          {isPremium && <ChevronIcon />}
        </Pressable>
      </GlassCard>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: spacing.xs },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: { flex: 1 },
  title: { color: colors.gold, fontFamily: typography.h3.fontFamily, fontSize: 15.5 },
  subtitle: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 12.5, marginTop: 2 },
  cta: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
});
