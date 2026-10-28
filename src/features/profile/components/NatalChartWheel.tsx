import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from "react-native-reanimated";
import { NatalWheelSVG } from "@shared/components";
import { ZODIAC_SIGNS, ZodiacSign, colors } from "@shared/theme";

type Placement = { label: string; sign: ZodiacSign; glyph: string; color: string };

type Props = {
  sun: ZodiacSign;
  moon: ZodiacSign;
  ascendant: ZodiacSign;
  size?: number;
};

function angleForSign(sign: ZodiacSign): number {
  const idx = ZODIAC_SIGNS.indexOf(sign);
  return (idx / 12) * Math.PI * 2 - Math.PI / 2;
}

export function NatalChartWheel({ sun, moon, ascendant, size = 280 }: Props) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: 1400, easing: Easing.out(Easing.cubic) });
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: progress.value, transform: [{ scale: 0.9 + progress.value * 0.1 }] }));

  const placements: Placement[] = [
    { label: "Sun", sign: sun, glyph: "☉", color: colors.accent },
    { label: "Moon", sign: moon, glyph: "☾", color: colors.violet },
    { label: "Rising", sign: ascendant, glyph: "ASC", color: colors.teal },
  ];

  const c = size / 2;
  const markerR = size * 0.27;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <NatalWheelSVG size={size} showInnerChart />
      <Animated.View style={[StyleSheet.absoluteFill, style]}>
        <Svg width={size} height={size}>
          {placements.map((p) => {
            const angle = angleForSign(p.sign);
            const x = c + Math.cos(angle) * markerR;
            const y = c + Math.sin(angle) * markerR;
            return (
              <React.Fragment key={p.label}>
                <Circle cx={x} cy={y} r={size * 0.055} fill={colors.bg1} stroke={p.color} strokeWidth={1.6} />
                <SvgText
                  x={x}
                  y={y + size * 0.018}
                  fontSize={size * 0.045}
                  fill={p.color}
                  textAnchor="middle"
                  fontWeight="700"
                >
                  {p.glyph}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
});
