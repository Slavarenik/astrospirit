import React, { useEffect, useMemo } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle, Line } from "react-native-svg";
import { NatalWheelSVG } from "./NatalWheelSVG";
import { colors } from "@shared/theme";

const { width, height } = Dimensions.get("window");
const GRID_GAP = 28;

type Star = { x: number; y: number; r: number; opacity: number };

type CornerRaysProps = {
  originX: number;
  originY: number;
  angleStart: number;
  angleEnd: number;
  length: number;
};

/** A faint quarter-sunburst fan radiating from a screen corner — the same
 *  petal vocabulary as SunburstMandala, kept very low-opacity so it reads
 *  as ambient texture rather than a hero graphic. */
function CornerRays({ originX, originY, angleStart, angleEnd, length }: CornerRaysProps) {
  const count = 13;
  const rays = Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const angle = ((angleStart + t * (angleEnd - angleStart)) * Math.PI) / 180;
    const len = length * (i % 3 === 0 ? 1 : 0.68);
    const x2 = originX + Math.cos(angle) * len;
    const y2 = originY + Math.sin(angle) * len;
    return (
      <Line key={i} x1={originX} y1={originY} x2={x2} y2={y2} stroke={colors.gold} strokeWidth={0.8} opacity={0.5} />
    );
  });

  const arcDots = Array.from({ length: 10 }, (_, i) => {
    const t = i / 9;
    const angle = ((angleStart + t * (angleEnd - angleStart)) * Math.PI) / 180;
    const x = originX + Math.cos(angle) * length * 1.08;
    const y = originY + Math.sin(angle) * length * 1.08;
    return <Circle key={i} cx={x} cy={y} r={1.1} fill={colors.gold} opacity={0.4} />;
  });

  return (
    <>
      {rays}
      {arcDots}
    </>
  );
}

function makeStars(count: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.1 + 0.4,
    opacity: Math.random() * 0.4 + 0.15,
  }));
}

function makeGridDots(): { x: number; y: number }[] {
  const dots: { x: number; y: number }[] = [];
  for (let x = GRID_GAP; x < width; x += GRID_GAP) {
    for (let y = GRID_GAP; y < height; y += GRID_GAP) {
      dots.push({ x, y });
    }
  }
  return dots;
}

type Props = {
  children?: React.ReactNode;
  variant?: "default" | "night" | "plain";
  /** Opt-in faint corner wheel accent (off by default — the reference
   *  screens keep backgrounds flat and reserve wheel art for hero content). */
  showWheel?: boolean;
};

/**
 * Shared flat backdrop for every screen: solid charcoal fill, a faint
 * gold dot-grid texture (matching the reference "Birth Chart" background),
 * and a sparse scatter of twinkling gold stars. No gradients, no neon —
 * flat and quiet so ornamental foreground graphics carry the design.
 */
export function ScreenBackground({ children, variant = "default", showWheel = false }: Props) {
  const stars = useMemo(() => makeStars(26), []);
  const gridDots = useMemo(() => makeGridDots(), []);
  const twinkle = useSharedValue(0.5);
  const rotation = useSharedValue(0);

  useEffect(() => {
    twinkle.value = withRepeat(withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.ease) }), -1, true);
    rotation.value = withRepeat(withTiming(360, { duration: 140000, easing: Easing.linear }), -1, false);
  }, []);

  const starStyle = useAnimatedStyle(() => ({ opacity: twinkle.value }));
  const wheelStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  const bgColor = variant === "night" ? colors.bg0 : colors.bg1;

  return (
    <View style={[styles.root, { backgroundColor: bgColor }]}>
      {variant !== "plain" && (
        <>
          <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
            {gridDots.map((d, i) => (
              <Circle key={i} cx={d.x} cy={d.y} r={0.7} fill={colors.gold} opacity={0.07} />
            ))}
            <CornerRays originX={0} originY={0} angleStart={0} angleEnd={90} length={width * 0.3} />
            <CornerRays originX={width} originY={height} angleStart={180} angleEnd={270} length={width * 0.3} />
          </Svg>

          <Animated.View style={[StyleSheet.absoluteFill, starStyle]}>
            <Svg width={width} height={height}>
              {stars.map((s, i) => (
                <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill={colors.goldLight} opacity={s.opacity} />
              ))}
            </Svg>
          </Animated.View>

          {showWheel && (
            <Animated.View
              style={[styles.wheelAccent, wheelStyle, { right: -width * 0.32, top: -width * 0.28 }]}
              pointerEvents="none"
            >
              <NatalWheelSVG size={width * 0.85} strokeColor={colors.gold} glyphColor={colors.gold} opacity={0.08} />
            </Animated.View>
          )}
        </>
      )}

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  wheelAccent: { position: "absolute" },
});
