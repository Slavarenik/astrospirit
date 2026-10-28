import React, { useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { NatalWheelSVG } from "./NatalWheelSVG";
import { colors, typography } from "@shared/theme";

type Props = {
  size?: number;
  label?: string;
};

/**
 * App-wide loading indicator: a natal-chart wheel whose rings counter-rotate
 * and whose core pulses — used anywhere the product spec calls for a
 * "natal chart style" loader.
 */
export function NatalLoader({ size = 120, label }: Props) {
  const rotation = useSharedValue(0);
  const counterRotation = useSharedValue(0);
  const pulse = useSharedValue(0.9);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 9000, easing: Easing.linear }),
      -1,
      false
    );
    counterRotation.value = withRepeat(
      withTiming(-360, { duration: 14000, easing: Easing.linear }),
      -1,
      false
    );
    pulse.value = withRepeat(
      withTiming(1.08, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${counterRotation.value}deg` }, { scale: pulse.value }],
  }));

  return (
    <View style={styles.outer}>
      <View style={[styles.wrap, { width: size, height: size }]}>
        <Animated.View style={[StyleSheet.absoluteFill, outerStyle]}>
          <NatalWheelSVG size={size} showInnerChart={false} strokeColor={colors.accent} glyphColor={colors.accent} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, innerStyle, styles.center]}>
          <NatalWheelSVG
            size={size * 0.62}
            showGlyphs={false}
            showTicks={false}
            strokeColor={colors.accentGlow}
          />
        </Animated.View>
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { alignItems: "center", justifyContent: "center" },
  wrap: { alignItems: "center", justifyContent: "center" },
  center: { alignItems: "center", justifyContent: "center" },
  label: {
    marginTop: 14,
    color: colors.textSecondary,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.label.fontSize,
    letterSpacing: typography.label.letterSpacing,
    textTransform: "uppercase",
  },
});
