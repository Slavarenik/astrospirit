import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { colors, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";

type Phase = "Inhale" | "Hold" | "Exhale" | "Hold";

type Props = {
  pattern?: [number, number, number, number]; // inhale, hold, exhale, hold (seconds)
  size?: number;
};

export function BreathingCircle({ pattern = [4, 4, 4, 4], size = 160 }: Props) {
  const t = useT();
  const [inhale, hold1, exhale, hold2] = pattern;
  const scale = useSharedValue(0.55);
  const [phase, setPhase] = useState<Phase>("Inhale");

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: inhale * 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: hold1 * 1000 }),
        withTiming(0.55, { duration: exhale * 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.55, { duration: hold2 * 1000 })
      ),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    const total = (inhale + hold1 + exhale + hold2) * 1000;
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      setPhase("Inhale");
      const t1 = setTimeout(() => !cancelled && setPhase("Hold"), inhale * 1000);
      const t2 = setTimeout(() => !cancelled && setPhase("Exhale"), (inhale + hold1) * 1000);
      const t3 = setTimeout(() => !cancelled && setPhase("Hold"), (inhale + hold1 + exhale) * 1000);
      const t4 = setTimeout(run, total);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    };
    const cleanup = run();
    return () => {
      cancelled = true;
      cleanup && cleanup();
    };
  }, []);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View style={[styles.ring, style, { width: size, height: size, borderRadius: size / 2 }]} />
      <Animated.View
        style={[
          styles.innerRing,
          style,
          { width: size * 0.7, height: size * 0.7, borderRadius: (size * 0.7) / 2 },
        ]}
      />
      <View style={styles.labelWrap}>
        <Text style={styles.phase}>{t(`sanctuary.breath.${phase}`)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  ring: {
    position: "absolute",
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.goldLine,
  },
  innerRing: {
    position: "absolute",
    backgroundColor: colors.accent + "55",
  },
  labelWrap: { alignItems: "center" },
  phase: {
    color: colors.textPrimary,
    fontFamily: typography.h3.fontFamily,
    fontSize: 16,
    letterSpacing: 1,
  },
});
