import React from "react";
import { View } from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { colors } from "@shared/theme";

type Props = {
  /** Chronological series, oldest first — typically mood mapped to
   *  low=1..great=4 via computeJournalInsights. Needs at least 2 points. */
  values: number[];
  width?: number;
  height?: number;
  min?: number;
  max?: number;
};

/** A hand-built sparkline (no charting library in this codebase) — a soft
 *  gold line with a faint gradient fill underneath, plus a highlighted dot
 *  on the final point so "today" reads clearly. */
export function MoodSparkline({ values, width = 280, height = 64, min = 1, max = 4 }: Props) {
  if (values.length < 2) return null;

  const padX = 6;
  const padY = 10;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const span = Math.max(max - min, 0.0001);
  const stepX = innerW / (values.length - 1);

  const points = values.map((v, i) => {
    const x = padX + i * stepX;
    const y = padY + innerH - ((v - min) / span) * innerH;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath =
    `M${points[0].x.toFixed(1)},${(padY + innerH).toFixed(1)} ` +
    points.map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") +
    ` L${points[points.length - 1].x.toFixed(1)},${(padY + innerH).toFixed(1)} Z`;

  const last = points[points.length - 1];

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="sparklineFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.gold} stopOpacity={0.28} />
            <Stop offset="1" stopColor={colors.gold} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill="url(#sparklineFill)" stroke="none" />
        <Path d={linePath} fill="none" stroke={colors.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={last.x} cy={last.y} r={3.5} fill={colors.gold} />
      </Svg>
    </View>
  );
}
