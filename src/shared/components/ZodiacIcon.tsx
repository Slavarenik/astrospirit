import React from "react";
import { View, Image, StyleSheet } from "react-native";
import Svg, { Circle, G, Ellipse } from "react-native-svg";
import { colors, ZodiacSign } from "@shared/theme";
import { ZODIAC_IMAGES } from "./zodiacImages";
import { CornerSparkle } from "./CornerSparkle";

type Props = {
  sign: ZodiacSign;
  size?: number;
  /** "ring" = gold outline on dark (default list/badge use), "filled" = solid
   *  gold disc with dark glyph (selected/active state), "plain" = no frame,
   *  just the glyph strokes (for embedding inside other ornaments). */
  variant?: "ring" | "filled" | "plain";
  color?: string;
  sparkles?: boolean;
  /** Adds a small mirrored laurel-sprig flourish curling up from the base
   *  of the ring — classical medallion framing, hand-drawn, original. Best
   *  reserved for larger badges (56px+) where the leaves read clearly. */
  laurel?: boolean;
};

/** One mirrored laurel branch of small tapering leaves, curling from the
 *  bottom of the ring up one side — a generic classical ornament (not tied
 *  to any specific artwork), used to frame the larger zodiac badges. */
function LaurelBranch({
  cx,
  cy,
  ringR,
  size,
  side,
  leafColor,
}: {
  cx: number;
  cy: number;
  ringR: number;
  size: number;
  side: 1 | -1;
  leafColor: string;
}) {
  const leafCount = 5;
  return (
    <>
      {Array.from({ length: leafCount }).map((_, i) => {
        const t = i / (leafCount - 1);
        const delta = t * 0.95;
        const angle = Math.PI / 2 + side * delta;
        const r = ringR * 0.9;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const leafLen = size * (0.1 - t * 0.04);
        const leafW = leafLen * 0.4;
        const rotateDeg = (angle * 180) / Math.PI + 90;
        return (
          <Ellipse
            key={i}
            cx={x}
            cy={y}
            rx={leafLen / 2}
            ry={leafW / 2}
            fill={leafColor}
            opacity={0.55 - t * 0.2}
            transform={`rotate(${rotateDeg} ${x} ${y})`}
          />
        );
      })}
    </>
  );
}

/** A single zodiac sign rendered as a line-art glyph inside an ornamental
 *  circular frame — the styled zodiac icon used throughout the app. */
export function ZodiacIcon({ sign, size = 48, variant = "ring", color, sparkles = false, laurel = false }: Props) {
  const tintColor = variant === "filled" ? colors.textOnAccent : color ?? colors.gold;
  const glyphBox = size * 0.56;
  const offset = (size - glyphBox) / 2;

  return (
    <View style={{ width: size, height: size }}>
      {variant !== "plain" && (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={StyleSheet.absoluteFill}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 1.5}
            fill={variant === "filled" ? colors.gold : "transparent"}
            stroke={colors.gold}
            strokeWidth={1.8}
          />
          {variant === "ring" && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - 5.5}
              fill="none"
              stroke={colors.gold}
              strokeWidth={0.6}
              strokeDasharray={`${size * 0.03} ${size * 0.045}`}
              opacity={0.6}
            />
          )}
          {laurel && (
            <G>
              <LaurelBranch
                cx={size / 2}
                cy={size / 2}
                ringR={size / 2 - 1.5}
                size={size}
                side={-1}
                leafColor={variant === "filled" ? colors.goldDeep : colors.gold}
              />
              <LaurelBranch
                cx={size / 2}
                cy={size / 2}
                ringR={size / 2 - 1.5}
                size={size}
                side={1}
                leafColor={variant === "filled" ? colors.goldDeep : colors.gold}
              />
            </G>
          )}
        </Svg>
      )}
      <Image
        source={ZODIAC_IMAGES[sign]}
        style={{
          position: "absolute",
          left: offset,
          top: offset,
          width: glyphBox,
          height: glyphBox,
          tintColor,
        }}
        resizeMode="contain"
      />
      {sparkles && variant !== "plain" && (
        <>
          <View style={[styles.sparkle, { top: -size * 0.1, left: size / 2 - size * 0.075 }]}>
            <CornerSparkle size={size * 0.15} color={colors.gold} />
          </View>
          <View style={[styles.sparkle, { top: -2, left: -2 }]}>
            <CornerSparkle size={size * 0.13} color={colors.gold} opacity={0.75} />
          </View>
          <View style={[styles.sparkle, { bottom: -2, right: -2 }]}>
            <CornerSparkle size={size * 0.13} color={colors.gold} opacity={0.75} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sparkle: { position: "absolute" },
});
