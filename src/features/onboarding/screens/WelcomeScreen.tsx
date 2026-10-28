import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from "react-native-reanimated";
import { ScreenBackground, GlowButton, FadeInUp, SunburstMandala, OrnateFrame } from "@shared/components";
import { colors, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { OnboardingStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const t = useT();
  const breathe = useSharedValue(0.96);

  useEffect(() => {
    breathe.value = withRepeat(withTiming(1.03, { duration: 3400, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);

  const mandalaStyle = useAnimatedStyle(() => ({ transform: [{ scale: breathe.value }] }));

  return (
    <ScreenBackground variant="night">
      <OrnateFrame />
      <View style={[styles.container, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg }]}>
        <FadeInUp style={styles.mandalaWrap} delay={80}>
          <Animated.View style={mandalaStyle}>
            <SunburstMandala size={240} />
          </Animated.View>
        </FadeInUp>

        <FadeInUp delay={260} style={styles.textBlock}>
          <Text style={styles.title}>{t("onboarding.welcome.title")}</Text>
          <Text style={styles.subtitle}>{t("onboarding.welcome.subtitle")}</Text>
        </FadeInUp>

        <FadeInUp delay={420} style={{ width: "100%" }}>
          <GlowButton title={t("onboarding.welcome.start")} onPress={() => navigation.navigate("Name")} />
        </FadeInUp>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: "space-between", alignItems: "center" },
  mandalaWrap: { marginTop: spacing.xxl, alignItems: "center" },
  textBlock: { alignItems: "center" },
  title: {
    color: colors.gold,
    fontFamily: typography.display.fontFamily,
    fontSize: 40,
    letterSpacing: 3.5,
    textAlign: "center",
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: 14.5,
    lineHeight: 21,
    textAlign: "center",
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
});
