import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Svg, { Path, Rect, Line } from "react-native-svg";
import { GlassCard, FadeInUp, GlowButton } from "@shared/components";
import { colors, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { useIntentionsStore } from "@shared/storage/useIntentionsStore";
import { usePremiumStore } from "@shared/storage/usePremiumStore";
import { usePaywallNavigation } from "@shared/hooks/usePaywallNavigation";
import { CalendarStackParamList } from "@app/navigation/types";

// Matches the outline GlowButton's own label color, since this only ever
// sits inside that variant here (same convention as AstroPassportCard).
function LockIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
      <Path d="M6 11V8a6 6 0 1112 0v3" stroke={colors.gold} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M5 11h14v9H5z" stroke={colors.gold} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function CalendarIcon({ color }: { color: string }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2.5" stroke={color} strokeWidth={1.8} />
      <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

export function JournalPromptCard() {
  const t = useT();
  const navigation = useNavigation<NativeStackNavigationProp<CalendarStackParamList>>();
  const latest = useIntentionsStore((s) => s.journal[0]);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const goToPaywall = usePaywallNavigation();

  const subtitle = latest
    ? t("journal.lastEntry").replace("{{mood}}", t(`journal.moodDesc.${latest.mood}`))
    : t("journal.cardEmpty");

  const handleInsightsPress = () => {
    if (!isPremium) {
      goToPaywall();
      return;
    }
    navigation.navigate("JournalInsights");
  };

  return (
    <FadeInUp delay={200}>
      <GlassCard sparkles>
        <Text style={styles.title}>{t("journal.title")}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.actionsStack}>
          <GlowButton
            title={latest ? t("journal.ctaContinue") : t("journal.ctaStart")}
            variant="outline"
            onPress={() => navigation.navigate("EveningJournal")}
          />
          <GlowButton
            title={t("journal.insights.cta")}
            variant="outline"
            icon={
              <View style={styles.insightsIcons}>
                <CalendarIcon color={colors.gold} />
                {!isPremium && <LockIcon />}
              </View>
            }
            onPress={handleInsightsPress}
          />
        </View>
      </GlassCard>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.textPrimary, fontFamily: typography.h3.fontFamily, fontSize: 17 },
  subtitle: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 13.5, marginTop: 6, lineHeight: 19 },
  actionsStack: { marginTop: spacing.md, gap: spacing.sm },
  insightsIcons: { flexDirection: "row", alignItems: "center", gap: 5 },
});
