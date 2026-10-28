import React from "react";
import Svg, { Circle, Line, G, Path } from "react-native-svg";
import { colors, ZODIAC_SIGNS } from "@shared/theme";
import { ZODIAC_GLYPH_PATHS } from "./zodiacGlyphPaths";

type Props = {
  size?: number;
  strokeColor?: string;
  glyphColor?: string;
  showGlyphs?: boolean;
  showTicks?: boolean;
  showInnerChart?: boolean;
  opacity?: number;
};

/**
 * The ornamental natal-chart wheel — redrawn in the reference's flat,
 * thin-line gold style: a dotted outer halo, a solid ring, radial
 * dividers for the 12 houses, hand-drawn glyph icons in the outer band,
 * faint constellation dot-lines inside each segment, and an 8-point
 * compass star at the core. Used both as a static background motif and
 * as the base graphic for the animated loaders.
 */
export function NatalWheelSVG({
  size = 300,
  strokeColor = colors.gold,
  glyphColor = colors.gold,
  showGlyphs = true,
  showTicks = true,
  showInnerChart = true,
  opacity = 1,
}: Props) {
  const c = size / 2;
  const haloR = size * 0.48;
  const ringR = size * 0.44;
  const glyphR = size * 0.385;
  const dividerInnerR = size * 0.2;
  const coreR = size * 0.1;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ opacity }}>
      {/* dotted outer halo */}
      <Circle
        cx={c}
        cy={c}
        r={haloR}
        stroke={strokeColor}
        strokeWidth={size * 0.0028}
        strokeDasharray={`${size * 0.006} ${size * 0.013}`}
        fill="none"
        opacity={0.55}
      />
      {/* solid ring */}
      <Circle cx={c} cy={c} r={ringR} stroke={strokeColor} strokeWidth={size * 0.0028} fill="none" opacity={0.75} />

      {/* 12 radial dividers */}
      {showTicks &&
        Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2 - Math.PI / 2 - Math.PI / 12;
          const x1 = c + Math.cos(angle) * dividerInnerR;
          const y1 = c + Math.sin(angle) * dividerInnerR;
          const x2 = c + Math.cos(angle) * ringR;
          const y2 = c + Math.sin(angle) * ringR;
          return (
            <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={strokeColor} strokeWidth={size * 0.0018} opacity={0.4} />
          );
        })}

      {/* faint constellation dots inside each house */}
      {showInnerChart &&
        Array.from({ length: 12 }).map((_, i) => {
          const segAngle = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const seeds = [0.3, 0.55, 0.45];
          const pts = seeds.map((rFrac, j) => {
            const a = segAngle + (j - 1) * 0.22;
            const r = dividerInnerR * 0.3 + rFrac * (ringR - dividerInnerR) * 0.6;
            return { x: c + Math.cos(a) * r, y: c + Math.sin(a) * r };
          });
          return (
            <G key={i} opacity={0.3}>
              <Line x1={pts[0].x} y1={pts[0].y} x2={pts[1].x} y2={pts[1].y} stroke={strokeColor} strokeWidth={0.5} />
              <Line x1={pts[1].x} y1={pts[1].y} x2={pts[2].x} y2={pts[2].y} stroke={strokeColor} strokeWidth={0.5} />
              {pts.map((p, k) => (
                <Circle key={k} cx={p.x} cy={p.y} r={size * 0.004} fill={strokeColor} />
              ))}
            </G>
          );
        })}

      {/* zodiac glyphs in the outer band */}
      {showGlyphs &&
        ZODIAC_SIGNS.map((sign, i) => {
          const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const x = c + Math.cos(angle) * glyphR;
          const y = c + Math.sin(angle) * glyphR;
          const glyphSize = size * 0.052;
          const half = glyphSize / 2;
          return (
            <G key={sign} transform={`translate(${x - half}, ${y - half}) scale(${glyphSize / 24})`} opacity={0.85}>
              {ZODIAC_GLYPH_PATHS[sign].map((d, pi) => (
                <Path
                  key={pi}
                  d={d}
                  stroke={glyphColor}
                  strokeWidth={1.9}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ))}
            </G>
          );
        })}

      {/* inner dotted ring around the core */}
      <Circle
        cx={c}
        cy={c}
        r={dividerInnerR}
        stroke={strokeColor}
        strokeWidth={size * 0.0018}
        strokeDasharray={`${size * 0.004} ${size * 0.009}`}
        fill="none"
        opacity={0.4}
      />

      {/* 8-point compass star core */}
      <CompassStar cx={c} cy={c} r={coreR} color={strokeColor} />
    </Svg>
  );
}

function CompassStar({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  const points: string[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const isLong = i % 2 === 0;
    const pr = isLong ? r : r * 0.4;
    const x = cx + Math.cos(angle) * pr;
    const y = cy + Math.sin(angle) * pr;
    points.push(`${x},${y}`);
  }
  return <Path d={`M ${points.join(" L ")} Z`} fill={color} opacity={0.9} />;
}
