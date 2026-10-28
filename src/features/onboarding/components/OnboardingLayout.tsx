import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { ScreenBackground, ProgressDots, FadeInUp } from "@shared/components";
import { colors, spacing, typography } from "@shared/theme";

type Props = {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  centered?: boolean;
};

/** Shared onboarding chrome — circular bordered back button, centered
 *  tracked-uppercase gold serif title, matching the reference data-entry
 *  and card-select screens. */
export function OnboardingLayout({ step, totalSteps, title, subtitle, onBack, children, footer, centered = true }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ScreenBackground>
      <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.header}>
          {onBack ? (
            <Pressable onPress={onBack} hitSlop={10} style={styles.circleBtn}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M15 5l-7 7 7 7" stroke={colors.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
          ) : (
            <View style={styles.circleBtn} />
          )}
          <View style={styles.circleBtn} />
        </View>

        <FadeInUp style={centered ? styles.titleBlockCentered : styles.titleBlock}>
          <Text style={[styles.title, centered && styles.titleCentered]}>{title.toUpperCase()}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, centered && styles.subtitleCentered]}>{subtitle}</Text>
          ) : null}
          <View style={styles.dotsWrap}>
            <ProgressDots total={totalSteps} activeIndex={step} />
          </View>
        </FadeInUp>

        <FadeInUp delay={100} style={styles.body}>
          {children}
        </FadeInUp>

        {footer ? (
          <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>{footer}</View>
        ) : null}
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {},
  titleBlockCentered: { alignItems: "center" },
  title: {
    color: colors.gold,
    fontFamily: typography.h1.fontFamily,
    fontSize: 21,
    letterSpacing: 1.6,
  },
  titleCentered: { textAlign: "center" },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    marginTop: spacing.xs,
  },
  subtitleCentered: { textAlign: "center" },
  dotsWrap: { marginTop: spacing.md },
  body: { flex: 1, marginTop: spacing.xl },
  footer: { paddingTop: spacing.md },
});
