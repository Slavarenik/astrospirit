import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GlassCard, FadeInUp, GlowButton } from "@shared/components";
import { colors, radius, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { usePremiumStore } from "@shared/storage/usePremiumStore";
import { usePaywallNavigation } from "@shared/hooks/usePaywallNavigation";
import { CardBack } from "@features/tarot/components/CardBack";
import { MyDayStackParamList } from "@app/navigation/types";

const MINI_W = 34;
const MINI_H = MINI_W * 1.62;

function LockIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path d="M6 11V8a6 6 0 1112 0v3" stroke={colors.textTertiary} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M5 11h14v9H5z" stroke={colors.textTertiary} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

/** Its own standalone block on My Day — Stage 1's premium tarot spreads
 *  feature used to be a plain text link tucked under CardOfDayWidget; this
 *  is the real card for it, with a small preview of the spread's layout
 *  (three mini card backs) rather than just a line of text. */
export function TarotSpreadsWidget() {
  const t = useT();
  const navigation = useNavigation<NativeStackNavigationProp<MyDayStackParamList>>();
  const isPremium = usePremiumStore((s) => s.isPremium);
  const goToPaywall = usePaywallNavigation();

  const handlePress = () => {
    if (!isPremium) {
      goToPaywall();
      return;
    }
    navigation.navigate("TarotSpreadIntro");
  };

  return (
    <FadeInUp delay={160}>
      <GlassCard sparkles>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t("tarotSpreads.widgetTitle")}</Text>
            <Text style={styles.subtitle}>{t("tarotSpreads.widgetSubtitle")}</Text>
          </View>
          {!isPremium && (
            <View style={styles.lockBadge}>
              <LockIcon />
            </View>
          )}
        </View>

        <Pressable onPress={handlePress} style={styles.previewRow}>
          <View style={styles.miniStack}>
            <CardBack width={MINI_W} height={MINI_H} />
            <CardBack width={MINI_W} height={MINI_H} />
            <CardBack width={MINI_W} height={MINI_H} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.previewTitle}>{t("tarotSpreads.threeCard.title")}</Text>
            <Text style={styles.previewSubtitle} numberOfLines={2}>
              {t("tarotSpreads.threeCard.subtitle")}
            </Text>
          </View>
        </Pressable>

        <GlowButton title={t("tarotSpreads.cta")} variant="outline" onPress={handlePress} style={{ marginTop: spacing.md }} />
      </GlassCard>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.sm, gap: spacing.sm },
  title: { color: colors.textPrimary, fontFamily: typography.h3.fontFamily, fontSize: 17 },
  subtitle: { color: colors.textTertiary, fontFamily: typography.caption.fontFamily, fontSize: typography.caption.fontSize },
  lockBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  previewRow: { flexDirection: "row", gap: spacing.md, alignItems: "center" },
  miniStack: { flexDirection: "row", gap: 4 },
  previewTitle: { color: colors.textPrimary, fontFamily: typography.h3.fontFamily, fontSize: 15 },
  previewSubtitle: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 12.5, marginTop: 2, lineHeight: 17 },
});
