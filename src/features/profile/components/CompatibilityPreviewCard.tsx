import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GlassCard, FadeInUp, GlowButton } from "@shared/components";
import { colors, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { ProfileStackParamList } from "@app/navigation/types";

export function CompatibilityPreviewCard() {
  const t = useT();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  return (
    <FadeInUp delay={200}>
      <GlassCard sparkles>
        <Text style={styles.title}>{t("compatibility.title")}</Text>
        <Text style={styles.subtitle}>{t("compatibility.subtitle")}</Text>
        <GlowButton
          title={t("compatibility.cta")}
          variant="outline"
          onPress={() => navigation.navigate("Compatibility")}
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
