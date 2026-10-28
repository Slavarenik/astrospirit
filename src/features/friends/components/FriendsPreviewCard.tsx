import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Svg, { Path } from "react-native-svg";
import { GlassCard, FadeInUp, GlowButton, ZodiacIcon } from "@shared/components";
import { colors, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { useFriendsStore } from "@shared/storage/useFriendsStore";
import { usePremiumStore } from "@shared/storage/usePremiumStore";
import { usePaywallNavigation } from "@shared/hooks/usePaywallNavigation";
import { ProfileStackParamList } from "@app/navigation/types";

function LockIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
      <Path d="M6 11V8a6 6 0 1112 0v3" stroke={colors.textOnAccent} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M5 11h14v9H5z" stroke={colors.textOnAccent} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

/** Friends (add friends, compare natal charts, zodiac match %) is Premium
 *  content — this preview card is the only live entry point, so the gate
 *  lives here: non-Premium taps go straight to the paywall instead of in. */
export function FriendsPreviewCard() {
  const t = useT();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const friends = useFriendsStore((s) => s.friends);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const goToPaywall = usePaywallNavigation();

  const handlePress = () => {
    if (!isPremium) {
      goToPaywall();
      return;
    }
    navigation.navigate("Friends");
  };

  return (
    <FadeInUp delay={150}>
      <GlassCard sparkles>
        <View style={styles.headRow}>
          <Text style={styles.title}>{t("friends.title")}</Text>
          {!isPremium && (
            <View style={styles.premiumBadge}>
              <LockIcon />
              <Text style={styles.premiumBadgeText}>{t("common.premiumBadge")}</Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle}>{friends.length === 0 ? t("friends.empty") : t("friends.subtitle")}</Text>

        {friends.length > 0 && (
          <View style={styles.row}>
            {friends.slice(0, 6).map((f) => (
              <ZodiacIcon key={f.id} sign={f.sunSign} size={30} variant="ring" />
            ))}
          </View>
        )}

        <GlowButton
          title={friends.length === 0 ? t("friends.add") : t("friends.title")}
          variant="outline"
          onPress={handlePress}
          style={{ marginTop: spacing.md, alignSelf: "flex-start" }}
        />
      </GlassCard>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: colors.gold, fontFamily: typography.h3.fontFamily, fontSize: 17 },
  subtitle: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 13.5, marginTop: 4 },
  row: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.sm },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.gold,
  },
  premiumBadgeText: { color: colors.textOnAccent, fontFamily: typography.label.fontFamily, fontSize: 9.5, letterSpacing: typography.label.letterSpacing },
});
