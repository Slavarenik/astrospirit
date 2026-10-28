import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { ScreenBackground, FadeInUp, OrnateFrame, HeaderFlourish, LanguageSwitcher } from "@shared/components";
import { colors, spacing, typography } from "@shared/theme";
import { useUserStore } from "@shared/storage/useUserStore";
import { useT } from "@shared/i18n";
import { AstroPassportCard } from "../components/AstroPassportCard";
import { MindfulnessStats } from "../components/MindfulnessStats";
import { CompatibilityPreviewCard } from "../components/CompatibilityPreviewCard";
import { PremiumBanner } from "../components/PremiumBanner";
import { FriendsPreviewCard } from "@features/friends/components/FriendsPreviewCard";

export function ProfileHomeScreen() {
  const insets = useSafeAreaInsets();
  const resetProfile = useUserStore((s) => s.resetProfile);
  const t = useT();

  return (
    <ScreenBackground>
      <OrnateFrame />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <FadeInUp style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>{t("profile.eyebrow")}</Text>
            <Text style={styles.headline}>{t("profile.headline")}</Text>
            <HeaderFlourish />
          </View>
          <Pressable onPress={resetProfile} hitSlop={10} style={styles.resetBtn}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M4 4v6h6M20 20v-6h-6M4.5 15a8 8 0 0013.9 3.2M19.5 9A8 8 0 005.6 5.8"
                stroke={colors.gold}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        </FadeInUp>

        <View style={styles.langRow}>
          <Text style={styles.langLabel}>{t("profile.language")}</Text>
          <LanguageSwitcher />
        </View>

        <View style={styles.stack}>
          <PremiumBanner />
          <AstroPassportCard />
          <FriendsPreviewCard />
          <MindfulnessStats />
          <CompatibilityPreviewCard />
          {/* Account sign-in (AccountCard, @features/friends) pulled off the
              screen — not needed right now. Kept in place, not deleted, in
              case it's wanted again once Friends actually goes live. */}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.sm },
  eyebrow: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
  headline: { color: colors.gold, fontFamily: typography.display.fontFamily, fontSize: 32, marginTop: 4, letterSpacing: 0.8 },
  resetBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bg2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
  },
  stack: { gap: spacing.md, marginTop: spacing.xs },
  langRow: { marginTop: spacing.md, marginBottom: spacing.xs, gap: spacing.xs },
  langLabel: {
    color: colors.textTertiary,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
});
