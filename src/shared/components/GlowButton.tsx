import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle, StyleProp, ActivityIndicator } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, radius, spacing, typography } from "@shared/theme";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Flat solid-gold pill button, matching the reference's "START NOW" /
 *  "GENERATE CHART" buttons — no gradient sheen, no neon glow, just a
 *  confident flat fill with dark, wide-tracked uppercase text. */
export function GlowButton({ title, onPress, variant = "primary", disabled, loading, style, icon }: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 14, stiffness: 300 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 220 });
  };
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.selectionAsync().catch(() => {});
    onPress();
  };

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.textOnAccent : colors.gold} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              variant === "primary" ? styles.labelPrimary : styles.labelOther,
            ]}
          >
            {title.toUpperCase()}
          </Text>
        </>
      )}
    </>
  );

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        animStyle,
        styles.base,
        variant === "primary" ? styles.primary : variant === "outline" ? styles.outline : styles.ghostBtn,
        style,
        disabled && styles.disabled,
      ]}
    >
      {content}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    gap: spacing.xs,
  },
  primary: {
    backgroundColor: colors.gold,
  },
  outline: {
    borderWidth: 1.4,
    borderColor: colors.goldLineStrong,
    backgroundColor: "transparent",
  },
  ghostBtn: {
    backgroundColor: colors.bg2,
  },
  disabled: { opacity: 0.4 },
  label: {
    fontFamily: typography.bodyLg.fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    letterSpacing: 1.4,
  },
  labelPrimary: { color: colors.textOnAccent },
  labelOther: { color: colors.gold },
});
