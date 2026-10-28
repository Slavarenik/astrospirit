import React, { useEffect, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { NatalWheelSVG } from "@shared/components";
import { colors, ELEMENT_COLOR, ZODIAC_ELEMENT, ZODIAC_SIGNS, PLANET_GLYPHS, ZodiacSign } from "@shared/theme";
import { NatalPlacement, getWholeSignHouse } from "@shared/utils/astrology";

type Props = {
  placements: NatalPlacement[];
  /** When isReal is false, this is still just estimateAscendant's sign
   *  (see astrology.ts) — drawn as a dashed, muted marker at the sign's
   *  midpoint so it visually reads as "approximate" next to the real,
   *  ephemeris-based planet markers. */
  ascendant: ZodiacSign;
  /** True once the profile has a real geocoded Ascendant (astrology.ts's
   *  resolveAscendant) — draws a solid, full-opacity marker instead. */
  ascendantIsReal?: boolean;
  /** Exact ecliptic longitude (0-360°) for the real Ascendant — when given
   *  (isReal case), the marker is placed at this true degree instead of
   *  the sign midpoint. */
  ascendantLongitude?: number | null;
  size?: number;
  /** Called with a house number (1-12) when its badge is tapped. */
  onHousePress?: (house: number) => void;
};

function angleForLongitude(longitude: number): number {
  return (longitude / 360) * Math.PI * 2 - Math.PI / 2;
}

function angleForSignMidpoint(sign: ZodiacSign): number {
  const idx = ZODIAC_SIGNS.indexOf(sign);
  return angleForLongitude(idx * 30 + 15);
}

function circularGapDeg(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
}

/**
 * Spreads markers that sit too close in longitude onto outward "lanes" so
 * they don't visually overlap (real charts can have genuine conjunctions —
 * two or more planets within a few degrees of each other). Greedy: walk
 * the bodies in longitude order, place each in the first lane whose most
 * recently placed body is far enough away, otherwise try the next lane
 * out. NOTE: doesn't check the wrap-around gap between the first and last
 * sorted body (e.g. 358° vs 2°) — a rare residual edge case, not worth the
 * extra complexity for a visualization.
 */
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

/** The "real chart" wheel: every planet placed at its exact ephemeris
 *  degree in its own outer band (spread onto extra lanes when bodies are
 *  close together), a Whole Sign houses ring in the middle band (tappable
 *  — see onHousePress), and the Ascendant drawn as a visually distinct
 *  estimate. Used on FullChartScreen. */
export function FullChartWheel({
  placements,
  ascendant,
  ascendantIsReal = false,
  ascendantLongitude = null,
  size = 300,
  onHousePress,
}: Props) {
  const progress = useSharedValue(0);
  const breathe = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: 1400, easing: Easing.out(Easing.cubic) });
    breathe.value = withDelay(
      1400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const breatheScale = 1 + breathe.value * 0.018;
    return {
      opacity: progress.value,
      transform: [{ scale: (0.9 + progress.value * 0.1) * breatheScale }],
    };
  });

  const c = size / 2;
  const innerSize = size * 0.74;
  const innerOffset = (size - innerSize) / 2;
  const ascendantR = innerSize * 0.15;
  const houseR = innerSize * 0.27;
  const baseMarkerR = size * 0.4;
  const laneGap = size * 0.038;
  const maxLanes = 2;

  const lanes = useMemo(
    () => assignLanes(placements.map((p) => ({ key: p.key, longitude: p.longitude })), 13, maxLanes),
    [placements]
  );

  const houseBadges = useMemo(
    () =>
      ZODIAC_SIGNS.map((sign) => {
        const angle = angleForSignMidpoint(sign);
        return {
          sign,
          house: getWholeSignHouse(sign, ascendant),
          x: c + Math.cos(angle) * houseR,
          y: c + Math.sin(angle) * houseR,
        };
      }),
    [ascendant, c, houseR]
  );

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View style={{ position: "absolute", left: innerOffset, top: innerOffset }}>
        <NatalWheelSVG size={innerSize} showInnerChart />
      </View>

      <Animated.View style={[StyleSheet.absoluteFill, style]}>
        <Svg width={size} height={size}>
          {/* Ascendant — solid + full opacity once real (exact degree);
              dashed + muted at the sign midpoint while still an estimate.
              Drawn first so planet markers sit on top. */}
          {(() => {
            const angle =
              ascendantIsReal && ascendantLongitude != null
                ? angleForLongitude(ascendantLongitude)
                : angleForSignMidpoint(ascendant);
            const x = c + Math.cos(angle) * ascendantR;
            const y = c + Math.sin(angle) * ascendantR;
            return (
              <React.Fragment>
                <Circle
                  cx={x}
                  cy={y}
                  r={size * 0.04}
                  fill={colors.bg1}
                  stroke={colors.teal}
                  strokeWidth={ascendantIsReal ? 1.6 : 1.3}
                  strokeDasharray={ascendantIsReal ? undefined : `${size * 0.006} ${size * 0.01}`}
                  opacity={ascendantIsReal ? 1 : 0.75}
                />
                <SvgText
                  x={x}
                  y={y + size * 0.013}
                  fontSize={size * 0.026}
                  fill={colors.teal}
                  textAnchor="middle"
                  fontWeight="700"
                  opacity={ascendantIsReal ? 1 : 0.85}
                >
                  ASC
                </SvgText>
              </React.Fragment>
            );
          })()}

          {placements.map((p) => {
            const r = baseMarkerR + (lanes[p.key] ?? 0) * laneGap;
            const angle = angleForLongitude(p.longitude);
            const x = c + Math.cos(angle) * r;
            const y = c + Math.sin(angle) * r;
            const tint = ELEMENT_COLOR[ZODIAC_ELEMENT[p.sign]];
            return (
              <React.Fragment key={p.key}>
                <Circle cx={x} cy={y} r={size * 0.042} fill={colors.bg1} stroke={tint} strokeWidth={1.6} />
                <SvgText
                  x={x}
                  y={y + size * 0.014}
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

      {/* House number badges — plain RN Pressables overlaid on the SVG so
       *  they get a real, comfortable tap target regardless of how small
       *  the drawn glyph is. */}
      {houseBadges.map(({ sign, house, x, y }) => {
        const badgeSize = size * 0.09;
        return (
          <Pressable
            key={sign}
            onPress={() => onHousePress?.(house)}
            hitSlop={8}
            style={[
              styles.houseBadge,
              {
                width: badgeSize,
                height: badgeSize,
                borderRadius: badgeSize / 2,
                left: x - badgeSize / 2,
                top: y - badgeSize / 2,
              },
            ]}
          >
            <Text style={[styles.houseBadgeText, { fontSize: badgeSize * 0.42 }]}>{house}</Text>
            <View style={[styles.houseBadgeMark, { width: badgeSize * 0.4, height: badgeSize * 0.4 }]}>
              <Text style={[styles.houseBadgeMarkText, { fontSize: badgeSize * 0.26 }]}>?</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  houseBadge: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
  },
  houseBadgeText: { color: colors.gold, fontWeight: "700" },
  houseBadgeMark: {
    position: "absolute",
    top: -3,
    right: -3,
    borderRadius: 999,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  houseBadgeMarkText: { color: colors.textOnAccent, fontWeight: "700" },
});
