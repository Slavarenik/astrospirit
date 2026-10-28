import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenBackground, FadeInUp, OrnateFrame, HeaderFlourish } from "@shared/components";
import { colors, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { AudioGeneratorInput } from "../components/AudioGeneratorInput";
import { LibraryList } from "../components/LibraryList";

export function SanctuaryHomeScreen() {
  const insets = useSafeAreaInsets();
  const t = useT();

  return (
    <ScreenBackground variant="night">
      <OrnateFrame />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <FadeInUp>
          <Text style={styles.eyebrow}>{t("sanctuary.eyebrow")}</Text>
          <Text style={styles.headline}>{t("sanctuary.headline")}</Text>
          <HeaderFlourish />
        </FadeInUp>

        <View style={styles.stack}>
          <AudioGeneratorInput />
          <LibraryList />
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
    fontSize: 30,
    marginTop: 4,
    letterSpacing: 0.8,
  },
  stack: { gap: spacing.md, marginTop: spacing.xs },
});
