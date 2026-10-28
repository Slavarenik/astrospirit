import React from "react";
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from "react-native-svg";
import { colors } from "@shared/theme";

type Props = {
  illumination: number; // 0-1
  waxing: boolean;
  size?: number;
};

/**
 * Draws a moon disc with a terminator curve approximating the given
 * illumination fraction — waxing fills from the right, waning from the left.
 */
export function MoonPhaseSVG({ illumination, waxing, size = 64 }: Props) {
  const r = size / 2 - 2;
  const c = size / 2;
  // Map illumination (0-1) to terminator ellipse rx (-r..r)
  const k = 1 - illumination * 2; // 1 = new, -1 = full
  const rx = Math.abs(k) * r;
  const sweepOuter = waxing ? 1 : 0;
  const sweepInner = k >= 0 ? (waxing ? 0 : 1) : (waxing ? 1 : 0);

  const path = `
    M ${c} ${c - r}
    A ${r} ${r} 0 0 ${sweepOuter} ${c} ${c + r}
    A ${rx} ${r} 0 0 ${sweepInner} ${c} ${c - r}
    Z
  `;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id="moonGlow" cx="50%" cy="50%" r="60%">
          <Stop offset="0%" stopColor={colors.accentGlow} stopOpacity={0.35} />
          <Stop offset="100%" stopColor={colors.accentGlow} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={c} cy={c} r={size / 2} fill="url(#moonGlow)" />
      <Circle cx={c} cy={c} r={r} fill={colors.bg3} stroke={colors.hairlineStrong} strokeWidth={1} />
      <Path d={path} fill={colors.accentGlow} opacity={0.95} />
    </Svg>
  );
}
