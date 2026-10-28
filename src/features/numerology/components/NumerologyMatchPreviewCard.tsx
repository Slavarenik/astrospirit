import React from "react";
import { Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GlassCard, FadeInUp, GlowButton } from "@shared/components";
import { colors, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { NumerologyStackParamList } from "@app/navigation/types";

/** Entry point into the numerology compatibility screen — same shape as
 *  profile's `CompatibilityPreviewCard`, just pointed at the numerology
 *  stack's own modal instead of the zodiac one. */
export function NumerologyMatchPreviewCard() {
  const t = useT();
  const navigation = useNavigation<NativeStackNavigationProp<NumerologyStackParamList>>();

  return (
    <FadeInUp delay={400}>
      <GlassCard sparkles>
        <Text style={styles.title}>{t("numerology.match.previewTitle")}</Text>
        <Text style={styles.subtitle}>{t("numerology.match.previewSubtitle")}</Text>
        <GlowButton
          title={t("numerology.match.previewCta")}
          variant="outline"
          onPress={() => navigation.navigate("NumerologyMatch")}
          style={{ marginTop: spacing.md, alignSelf: "flex-start" }}
        />
      </GlassCard>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.gold, fontFamily: typography.h3.fontFamily, fontSize: 17 },
  subtitle: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 13.5, marginTop: 4 },
});
