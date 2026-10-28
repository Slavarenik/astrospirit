import React from "react";
import Svg, { Circle, Path, G, Line } from "react-native-svg";
import { colors } from "@shared/theme";

type Props = {
  size?: number;
  color?: string;
  opacity?: number;
};

/**
 * The radiating sunburst-and-moon mandala from the splash reference:
 * a many-petaled sunburst with a crescent-moon medallion at its core,
 * a dotted halo ring below holding a second crescent, and beaded
 * strings hanging from it. Pure line-art, single gold tone.
 */
export function SunburstMandala({ size = 280, color = colors.gold, opacity = 1 }: Props) {
  const c = size / 2;
  const petals = 20;
  const outerR = size * 0.27;
  const innerR = size * 0.1;
  const medallionR = size * 0.14;
  const haloCy = size * 0.62;
  const haloR = size * 0.21;

  const petalPaths: string[] = [];
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2 - Math.PI / 2;
    const baseA1 = a - (Math.PI / petals) * 0.32;
    const baseA2 = a + (Math.PI / petals) * 0.32;
    const tipX = c + Math.cos(a) * outerR;
    const tipY = c * 0.5 + Math.sin(a) * outerR * 0.78;
    const b1x = c + Math.cos(baseA1) * innerR;
    const b1y = c * 0.5 + Math.sin(baseA1) * innerR * 0.78;
    const b2x = c + Math.cos(baseA2) * innerR;
    const b2y = c * 0.5 + Math.sin(baseA2) * innerR * 0.78;
    petalPaths.push(`M ${b1x} ${b1y} L ${tipX} ${tipY} L ${b2x} ${b2y}`);
  }

  const beadCount = 7;

  return (
    <Svg width={size} height={size * 1.05} viewBox={`0 0 ${size} ${size * 1.05}`} opacity={opacity}>
      {/* sunburst petals */}
      <G>
        {petalPaths.map((d, i) => (
          <Path key={i} d={d} stroke={color} strokeWidth={1} strokeLinejoin="round" fill="none" opacity={0.85} />
        ))}
      </G>
      {/* small ring dots around sunburst */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r = outerR * 1.14;
        const x = c + Math.cos(a) * r;
        const y = c * 0.5 + Math.sin(a) * r * 0.78;
        return <Circle key={i} cx={x} cy={y} r={size * 0.004} fill={color} opacity={0.55} />;
      })}

      {/* central medallion */}
      <Circle cx={c} cy={c * 0.5} r={medallionR} fill="none" stroke={color} strokeWidth={1.2} />
      <Path
        d={`M ${c + medallionR * 0.35} ${c * 0.5 - medallionR * 0.55}
            a ${medallionR * 0.62} ${medallionR * 0.62} 0 100 ${medallionR * 1.1}
            a ${medallionR * 0.46} ${medallionR * 0.46} 0 010 ${-medallionR * 1.1}z`}
        fill={color}
        opacity={0.9}
      />

      {/* connecting stem */}
      <Line x1={c} y1={c * 0.5 + outerR * 0.86} x2={c} y2={haloCy - haloR} stroke={color} strokeWidth={1} opacity={0.5} />

      {/* halo ring */}
      <Circle
        cx={c}
        cy={haloCy}
        r={haloR}
        fill="none"
        stroke={color}
        strokeWidth={1}
        strokeDasharray={`${size * 0.006} ${size * 0.014}`}
        opacity={0.75}
      />
      <Circle cx={c} cy={haloCy} r={haloR * 0.82} fill="none" stroke={color} strokeWidth={0.8} opacity={0.4} />

      {/* big crescent inside halo */}
      <Path
        d={`M ${c + haloR * 0.42} ${haloCy - haloR * 0.52}
            a ${haloR * 0.58} ${haloR * 0.58} 0 100 ${haloR * 1.04}
            a ${haloR * 0.42} ${haloR * 0.42} 0 010 ${-haloR * 1.04}z`}
        fill={color}
        opacity={0.92}
      />

      {/* scattered stars around halo */}
      {[
        [0.18, -0.9],
        [-0.7, -0.55],
        [0.78, -0.2],
        [-0.85, 0.35],
        [0.3, 0.95],
      ].map(([dx, dy], i) => (
        <Circle
          key={i}
          cx={c + dx * haloR * 1.35}
          cy={haloCy + dy * haloR * 1.1}
          r={size * 0.0045}
          fill={color}
          opacity={0.6}
        />
      ))}

      {/* beaded strings hanging from the halo */}
      {Array.from({ length: beadCount }).map((_, i) => {
        const spread = (i - (beadCount - 1) / 2) / ((beadCount - 1) / 2);
        const x = c + spread * haloR * 0.95;
        const dropLen = size * (0.1 + Math.abs(spread) * 0.07);
        const y0 = haloCy + haloR * 0.98;
        const beadCountOnString = 2 + (i % 2);
        return (
          <G key={i}>
            <Line x1={x} y1={y0} x2={x} y2={y0 + dropLen} stroke={color} strokeWidth={0.7} opacity={0.5} />
            {Array.from({ length: beadCountOnString }).map((_, j) => (
              <Circle
                key={j}
                cx={x}
                cy={y0 + dropLen * ((j + 1) / (beadCountOnString + 0.3))}
                r={size * 0.006}
                fill={color}
                opacity={0.65}
              />
            ))}
          </G>
        );
      })}
    </Svg>
  );
}
