import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenBackground, FadeInUp, OrnateFrame, HeaderFlourish } from "@shared/components";
import { colors, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { LunarCalendarWidget } from "../components/LunarCalendarWidget";
import { SpiritualTrackers } from "../components/SpiritualTrackers";
import { JournalPromptCard } from "../components/JournalPromptCard";

export function CalendarHomeScreen() {
  const insets = useSafeAreaInsets();
  const t = useT();

  return (
    <ScreenBackground>
      <OrnateFrame />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <FadeInUp>
          <Text style={styles.eyebrow}>{t("calendar.eyebrow")}</Text>
          <Text style={styles.headline}>{t("calendar.headline")}</Text>
          <HeaderFlourish />
        </FadeInUp>

        <View style={styles.stack}>
          <LunarCalendarWidget />
          <SpiritualTrackers />
          <JournalPromptCard />
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg },
  eyebrow: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
  headline: {
    color: colors.gold,
    fontFamily: typography.display.fontFamily,
    fontSize: 32,
    marginTop: 4,
    letterSpacing: 0.8,
  },
  stack: { gap: spacing.md, marginTop: spacing.xs },
});
