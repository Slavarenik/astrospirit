import React, { useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { NatalWheelSVG } from "@shared/components";
import { colors, ELEMENT_COLOR, ZODIAC_ELEMENT, PLANET_GLYPHS } from "@shared/theme";
import { NatalAspect, NatalPlacement, AspectType } from "@shared/utils/astrology";

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const WHEEL_ENTRANCE_MS = 1100;
/** How long each aspect line's own draw-in + stagger run before its
 *  perpetual "energy flow" animation is allowed to start. Keeps the
 *  entrance readable (lines appear one after another) instead of every
 *  line's ambient motion fighting for attention while the chart is still
 *  revealing itself. */
const LINE_DRAW_MS = 650;
const LINE_STAGGER_MS = 90;

/** Harmonious aspects (trine/sextile) read as cooperative energy, tense
 *  ones (square/opposition) as friction, conjunction as a neutral fusion —
 *  same "tint communicates meaning" convention `ELEMENT_COLOR` already
 *  uses elsewhere in this chart. */
const ASPECT_COLOR: Record<AspectType, string> = {
  conjunction: colors.gold,
  sextile: colors.teal,
  trine: colors.success,
  square: colors.rose,
  opposition: colors.danger,
};

function angleForLongitude(longitude: number): number {
  return (longitude / 360) * Math.PI * 2 - Math.PI / 2;
}

function circularGapDeg(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
}

/** Same greedy lane-spread `FullChartWheel` uses for close conjunctions,
 *  duplicated locally rather than shared — both are small, screen-specific
 *  layout helpers, same self-contained-file convention already used for
 *  things like `HeartPulse`/`ConnectorDots` across this app's screens. */
function assignLanes(items: { key: string; longitude: number }[], minGapDeg: number, maxLanes: number): Record<string, number> {
  const sorted = [...items].sort((a, b) => a.longitude - b.longitude);
  const laneLastAngle: number[] = [];
  const lanes: Record<string, number> = {};
  for (const item of sorted) {
    let lane = 0;
    while (lane < maxLanes - 1) {
      const last = laneLastAngle[lane];
      if (last === undefined || circularGapDeg(last, item.longitude) >= minGapDeg) break;
      lane++;
    }
    laneLastAngle[lane] = item.longitude;
    lanes[item.key] = lane;
  }
  return lanes;
}

type Point = { x: number; y: number };

/**
 * One aspect line, fully self-contained (its own entrance draw-in, then its
 * own perpetual "energy flowing between the two planets" loop) so each of
 * the chart's ~8-15 lines can stagger independently without juggling a
 * dynamically-sized array of shared values in the parent — same pattern
 * this app already uses for small per-item animated units elsewhere.
 */
function AspectLine({ a, b, color, delay, length }: { a: Point; b: Point; color: string; delay: number; length: number }) {
  const draw = useSharedValue(0);
  const glow = useSharedValue(0.6);
  const flow = useSharedValue(0);

  useEffect(() => {
    draw.value = withDelay(delay, withTiming(1, { duration: LINE_DRAW_MS, easing: Easing.out(Easing.cubic) }));

    const loopStart = delay + LINE_DRAW_MS;
    // Each line breathes and flows on its own period (varied slightly by
    // its stagger delay) so the whole web feels organic rather than every
    // connection pulsing in lockstep.
    const breatheMs = 1700 + (delay % 400);
    const flowMs = 2200 + (delay % 600);
    glow.value = withDelay(
      loopStart,
      withRepeat(
        withSequence(
          withTiming(1, { duration: breatheMs, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.4, { duration: breatheMs, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
    flow.value = withDelay(
      loopStart,
      withRepeat(
        withSequence(
          withTiming(1, { duration: flowMs, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: flowMs, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, []);

  const lineProps = useAnimatedProps(() => ({
    strokeDashoffset: length * (1 - draw.value),
    opacity: draw.value < 1 ? draw.value : glow.value,
  }));

  const sparkProps = useAnimatedProps(() => ({
    cx: a.x + (b.x - a.x) * flow.value,
    cy: a.y + (b.y - a.y) * flow.value,
    opacity: draw.value >= 1 ? 1 : 0,
  }));

  return (
    <>
      <AnimatedLine
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke={color}
        strokeWidth={1.3}
        strokeDasharray={length}
        animatedProps={lineProps}
      />
      <AnimatedCircle r={2.4} fill={color} animatedProps={sparkProps} />
    </>
  );
}

type Props = {
  placements: NatalPlacement[];
  aspects: NatalAspect[];
  size?: number;
};

/** The aspects chart's own wheel — a plain zodiac ring with the ten bodies
 *  around the edge and the aspect web drawn through the middle, where
 *  `FullChartWheel`'s house ring would otherwise sit. No houses or
 *  Ascendant here; this screen is about the lines, not the houses. */
export function AspectWheel({ placements, aspects, size = 320 }: Props) {
  const progress = useSharedValue(0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: WHEEL_ENTRANCE_MS, easing: Easing.out(Easing.cubic) });
    breathe.value = withDelay(
      WHEEL_ENTRANCE_MS,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, []);

  const wrapStyle = useAnimatedStyle(() => {
    const breatheScale = 1 + breathe.value * 0.015;
    return {
      opacity: progress.value,
      transform: [{ scale: (0.92 + progress.value * 0.08) * breatheScale }],
    };
  });

  const c = size / 2;
  const markerR = size * 0.4;
  const laneGap = size * 0.04;
  const maxLanes = 2;

  const lanes = useMemo(
    () => assignLanes(placements.map((p) => ({ key: p.key, longitude: p.longitude })), 11, maxLanes),
    [placements]
  );

  const points = useMemo(() => {
    const map: Record<string, Point> = {};
    for (const p of placements) {
      const r = markerR + (lanes[p.key] ?? 0) * laneGap;
      const angle = angleForLongitude(p.longitude);
      map[p.key] = { x: c + Math.cos(angle) * r, y: c + Math.sin(angle) * r };
    }
    return map;
  }, [placements, lanes, c, markerR, laneGap]);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <NatalWheelSVG size={size} showInnerChart={false} />

      <Animated.View style={[StyleSheet.absoluteFill, wrapStyle]}>
        <Svg width={size} height={size}>
          {aspects.map((asp, i) => {
            const a = points[asp.a];
            const b = points[asp.b];
            if (!a || !b) return null;
            const length = Math.hypot(b.x - a.x, b.y - a.y);
            return (
              <AspectLine
                key={`${asp.a}-${asp.b}`}
                a={a}
                b={b}
                color={ASPECT_COLOR[asp.type]}
                delay={i * LINE_STAGGER_MS}
                length={length}
              />
            );
          })}

          {placements.map((p) => {
            const pt = points[p.key];
            const tint = ELEMENT_COLOR[ZODIAC_ELEMENT[p.sign]];
            return (
              <React.Fragment key={p.key}>
                <Circle cx={pt.x} cy={pt.y} r={size * 0.042} fill={colors.bg1} stroke={tint} strokeWidth={1.6} />
                <SvgText
                  x={pt.x}
                  y={pt.y + size * 0.014}
                  fontSize={size * 0.034}
                  fill={tint}
                  textAnchor="middle"
                  fontWeight="700"
                >
                  {PLANET_GLYPHS[p.key]}
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
