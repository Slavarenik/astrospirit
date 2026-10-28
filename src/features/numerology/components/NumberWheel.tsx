import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from "react-native-reanimated";
import { NUMEROLOGY_VALUES } from "@shared/utils/numerology";
import { colors } from "@shared/theme";

export type WheelPoint = { value: number; label: string; color: string };

type Props = {
  points: WheelPoint[];
  size?: number;
};

function angleForValue(value: number): number {
  const idx = NUMEROLOGY_VALUES.indexOf(value as (typeof NUMEROLOGY_VALUES)[number]);
  const slot = idx === -1 ? 0 : idx;
  return (slot / NUMEROLOGY_VALUES.length) * Math.PI * 2 - Math.PI / 2;
}

/** A plain ring with the eleven numerology values (1-9, 11, 22) laid out
 *  around it, with one or more of them picked out as the person's own —
 *  same visual language as NatalChartWheel's sun/moon/rising markers, just
 *  without a zodiac backdrop. */
export function NumberWheel({ points, size = 220 }: Props) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: progress.value, transform: [{ scale: 0.92 + progress.value * 0.08 }] }));

  const c = size / 2;
  const markerR = size * 0.085;
  // Keep every marker (circle + stroke) fully inside the SVG box — a slot
  // radius of size*0.44 let highlighted markers at the top/bottom poke past
  // the canvas edge and get clipped, since slotR + markerR exceeded size/2.
  const slotR = size / 2 - markerR - size * 0.02;
  const ringR = slotR;

  const highlighted = new Set(points.map((p) => p.value));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={ringR} stroke={colors.goldLineHairline} strokeWidth={1} fill="none" />
        {NUMEROLOGY_VALUES.map((value) => {
          if (highlighted.has(value)) return null;
          const angle = angleForValue(value);
          const x = c + Math.cos(angle) * slotR;
          const y = c + Math.sin(angle) * slotR;
          return (
            <SvgText
              key={value}
              x={x}
              y={y + size * 0.018}
              fontSize={size * 0.052}
              fill={colors.textTertiary}
              textAnchor="middle"
            >
              {value}
            </SvgText>
          );
        })}
      </Svg>
      <Animated.View style={[StyleSheet.absoluteFill, style]}>
        <Svg width={size} height={size}>
          {points.map((p) => {
            const angle = angleForValue(p.value);
            const x = c + Math.cos(angle) * slotR;
            const y = c + Math.sin(angle) * slotR;
            return (
              <Line
                key={`line-${p.label}`}
                x1={c}
                y1={c}
                x2={x}
                y2={y}
                stroke={p.color}
                strokeWidth={1}
                strokeOpacity={0.35}
              />
            );
          })}
          {points.map((p) => {
            const angle = angleForValue(p.value);
            const x = c + Math.cos(angle) * slotR;
            const y = c + Math.sin(angle) * slotR;
            return (
              <React.Fragment key={p.label}>
                <Circle cx={x} cy={y} r={markerR} fill={colors.bg1} stroke={p.color} strokeWidth={1.8} />
                <SvgText
                  x={x}
                  y={y + size * 0.02}
                  fontSize={size * 0.06}
                  fill={p.color}
                  textAnchor="middle"
                  fontWeight="700"
                >
                  {p.value}
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
