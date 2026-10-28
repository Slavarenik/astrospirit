import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { colors } from "@shared/theme";

type Props = {
  inset?: number;
  radius?: number;
  color?: string;
};

/** The thin rounded gold border frame that wraps the "Zodiac Match"
 *  reference screens like a picture frame. Purely decorative, absolutely
 *  positioned and non-interactive, so it can sit above any screen content. */
export function OrnateFrame({ inset = 10, radius = 34, color = colors.gold }: Props) {
  const { width, height } = useWindowDimensions();
  const w = width - inset * 2;
  const h = height - inset * 2;

  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Rect
        x={inset}
        y={inset}
        width={w}
        height={h}
        rx={radius}
        ry={radius}
        stroke={color}
        strokeWidth={1.4}
        fill="none"
        opacity={0.55}
      />
    </Svg>
  );
}
