import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenBackground, FadeInUp, OrnateFrame, HeaderFlourish, LanguageSwitcher } from "@shared/components";
import { colors, spacing, typography } from "@shared/theme";
import { useUserStore } from "@shared/storage/useUserStore";
import { useT } from "@shared/i18n";
import { HoroscopeWidget } from "../components/HoroscopeWidget";
import { CardOfDayWidget } from "../components/CardOfDayWidget";
import { TarotSpreadsWidget } from "../components/TarotSpreadsWidget";
import { AffirmationWidget } from "../components/AffirmationWidget";

function greetingKey(): string {
  const h = new Date().getHours();
  if (h < 5) return "myDay.greetingNight";
  if (h < 12) return "myDay.greetingMorning";
  if (h < 18) return "myDay.greetingAfternoon";
  return "myDay.greetingEvening";
}

export function MyDayHomeScreen() {
  const insets = useSafeAreaInsets();
  const profile = useUserStore((s) => s.profile);
  const t = useT();

  return (
    <ScreenBackground>
      <OrnateFrame />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <FadeInUp>
          <Text style={styles.greeting}>{t(greetingKey())}, {profile?.name ?? "Seeker"}</Text>
          <Text style={styles.headline}>{t("myDay.headline")}</Text>
          <HeaderFlourish />
          <View style={{ marginTop: spacing.sm }}>
            <LanguageSwitcher />
          </View>
        </FadeInUp>

        <View style={styles.stack}>
          <HoroscopeWidget />
          <CardOfDayWidget />
          <TarotSpreadsWidget />
          <AffirmationWidget />
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg },
  greeting: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: 15,
  },
  headline: {
    color: colors.gold,
    fontFamily: typography.display.fontFamily,
    fontSize: 32,
    letterSpacing: 0.8,
  },
  stack: { gap: spacing.md, marginTop: spacing.xs },
});
