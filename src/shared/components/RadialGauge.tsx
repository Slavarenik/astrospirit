import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { colors, typography, spacing } from "@shared/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  value: number; // 0-100
  label: string;
  color?: string;
  size?: number;
  delay?: number;
};

/** 4-point compass-star tip, marking the start of the dial at 12 o'clock —
 *  a static ornamental echo of NatalWheelSVG's core motif. */
function TipStar({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const pr = i % 2 === 0 ? r : r * 0.4;
    pts.push(`${cx + Math.cos(angle) * pr},${cy + Math.sin(angle) * pr}`);
  }
  return <Path d={`M ${pts.join(" L ")} Z`} fill={color} opacity={0.95} />;
}

/** Ornamental index dial — a thin dotted gold halo (decoration, slowly and
 *  continuously spinning) around a flat-capped progress arc, with a small
 *  compass-star tip marker. Replaces the earlier thick, rounded-cap
 *  "modern app" progress ring with the same line-art vocabulary used
 *  throughout the rest of the design. */
export function RadialGauge({ value, label, color = colors.accent, size = 72, delay = 0 }: Props) {
  const r = size / 2 - 11;
  const circumference = 2 * Math.PI * r;
  const haloR = size / 2 - 3;
  const progress = useSharedValue(0);
  const haloRotation = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(value, { duration: 1100, easing: Easing.out(Easing.cubic) })
    );
  }, [value]);

  useEffect(() => {
    // Slow, continuous spin for the outer dotted halo — a small ambient
    // "alive" cue distinct from the one-shot fill animation on the arc.
    haloRotation.value = withRepeat(
      withTiming(360, { duration: 14000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value / 100),
  }));

  const haloAnimatedProps = useAnimatedProps(() => ({
    rotation: haloRotation.value,
  }));

  return (
    <View style={styles.wrap}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {/* static dotted outer halo */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={haloR}
            stroke={colors.goldLineHairline}
            strokeWidth={1}
            strokeDasharray={`${size * 0.02} ${size * 0.045}`}
            fill="none"
            animatedProps={haloAnimatedProps}
            origin={`${size / 2}, ${size / 2}`}
          />
          {/* faint full track */}
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.bg3} strokeWidth={2.4} fill="none" />
          {/* flat-cap progress arc */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="butt"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
          <TipStar cx={size / 2} cy={size / 2 - r} r={size * 0.045} color={color} />
        </Svg>
        <View style={styles.valueOverlay}>
          <Text style={styles.valueText}>{Math.round(value)}</Text>
        </View>
      </View>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: spacing.xs },
  valueOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  valueText: {
    color: colors.textPrimary,
    fontFamily: typography.h3.fontFamily,
    fontSize: 16,
  },
  label: {
    color: colors.textTertiary,
    fontSize: 9,
    fontFamily: typography.label.fontFamily,
    letterSpacing: 1,
    textAlign: "center",
  },
});
