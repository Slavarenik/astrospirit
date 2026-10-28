import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { NatalWheelSVG } from "@shared/components";
import { colors, radius, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { CardBack } from "@features/tarot/components/CardBack";

/** Three of the deck's own illustrated card backs, fanned out — the
 *  "spreads shown nicely" the premium preview is meant to lead with,
 *  using the real card art rather than a stand-in glyph. */
function TarotFan() {
  return (
    <View style={styles.fanWrap}>
      <View style={[styles.fanCard, { transform: [{ rotate: "-14deg" }, { translateY: 6 }] }]}>
        <CardBack width={46} height={74} />
      </View>
      <View style={[styles.fanCard, { transform: [{ translateY: -4 }], zIndex: 2 }]}>
        <CardBack width={50} height={81} />
      </View>
      <View style={[styles.fanCard, { transform: [{ rotate: "14deg" }, { translateY: 6 }] }]}>
        <CardBack width={46} height={74} />
      </View>
    </View>
  );
}

/** A small sparkline-like trend glyph standing in for Journal Insights. */
function JournalGlyph() {
  return (
    <Svg width={44} height={44} viewBox="0 0 48 48" fill="none">
      <Circle cx={24} cy={24} r={22} stroke={colors.goldLineHairline} strokeWidth={1} />
      <Path d="M12 30l6-10 6 5 6-13 6 6" stroke={colors.gold} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Circle cx={30} cy={18} r={2.4} fill={colors.gold} />
    </Svg>
  );
}

/** Crescent moon + a small rising arrow — Moon & Rising, for the
 *  Detailed Affirmation feature. */
function MoonRisingGlyph() {
  return (
    <Svg width={44} height={44} viewBox="0 0 48 48" fill="none">
      <Circle cx={24} cy={24} r={22} stroke={colors.goldLineHairline} strokeWidth={1} />
      <Path d="M27 15a10 10 0 100 18 11.5 11.5 0 010-18z" fill={colors.gold} opacity={0.9} />
      <Path d="M16 32l5-8M21 24l-2 4.5 4.5-1.3" stroke={colors.gold} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Tiny 3x3 digit-grid glyph for Premium Numerology (Hidden Talents,
 *  Pythagorean Square, Karmic Lessons, Career & Finance, Life Stages). */
function NumerologyGlyph() {
  const cells = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <Svg width={44} height={44} viewBox="0 0 48 48" fill="none">
      <Circle cx={24} cy={24} r={22} stroke={colors.goldLineHairline} strokeWidth={1} />
      {cells.map((n, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const x = 13 + col * 8;
        const y = 13 + row * 8;
        const filled = n === 5;
        return (
          <Rect
            key={n}
            x={x}
            y={y}
            width={6.4}
            height={6.4}
            rx={1.4}
            fill={filled ? colors.gold : "transparent"}
            stroke={colors.gold}
            strokeWidth={1}
            opacity={filled ? 1 : 0.55}
          />
        );
      })}
    </Svg>
  );
}

/** Two small head-and-shoulders silhouettes — the glyph for the Friends
 *  feature (real people added to the app, not just a sign-vs-sign match). */
function FriendsGlyph() {
  return (
    <Svg width={44} height={44} viewBox="0 0 48 48" fill="none">
      <Circle cx={24} cy={24} r={22} stroke={colors.goldLineHairline} strokeWidth={1} />
      <Circle cx={18} cy={19} r={4} stroke={colors.gold} strokeWidth={1.8} fill="none" />
      <Path d="M10 32c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke={colors.gold} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Circle cx={30} cy={19} r={4} stroke={colors.gold} strokeWidth={1.8} fill="none" opacity={0.85} />
      <Path d="M22 32c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke={colors.gold} strokeWidth={1.8} strokeLinecap="round" fill="none" opacity={0.85} />
    </Svg>
  );
}

/** Two overlapping rings (two charts) with a small heart at the overlap —
 *  the glyph for "zodiac compatibility matching". */
function MatchGlyph() {
  return (
    <Svg width={44} height={44} viewBox="0 0 48 48" fill="none">
      <Circle cx={19} cy={24} r={13} stroke={colors.gold} strokeWidth={1.4} opacity={0.85} />
      <Circle cx={29} cy={24} r={13} stroke={colors.gold} strokeWidth={1.4} opacity={0.85} />
      <Path
        d="M24 28.4s-4.6-2.9-4.6-6.3c0-1.6 1.2-2.8 2.7-2.8 1 0 1.9.56 2.3 1.35.4-.8 1.3-1.35 2.3-1.35 1.5 0 2.7 1.2 2.7 2.8 0 3.4-5.4 6.3-5.4 6.3z"
        fill={colors.gold}
      />
    </Svg>
  );
}

type PreviewSlide = {
  key: string;
  kind: "tarot" | "chart" | "glyph";
  glyph?: React.ReactNode;
  titleKey: string;
  captionKey: string;
};

const SLIDES: PreviewSlide[] = [
  { key: "tarot", kind: "tarot", titleKey: "paywall.previews.tarot.title", captionKey: "paywall.previews.tarot.caption" },
  { key: "chart", kind: "chart", titleKey: "paywall.previews.chart.title", captionKey: "paywall.previews.chart.caption" },
  { key: "journal", kind: "glyph", glyph: <JournalGlyph />, titleKey: "paywall.previews.journal.title", captionKey: "paywall.previews.journal.caption" },
  { key: "affirmation", kind: "glyph", glyph: <MoonRisingGlyph />, titleKey: "paywall.previews.affirmation.title", captionKey: "paywall.previews.affirmation.caption" },
  { key: "numerology", kind: "glyph", glyph: <NumerologyGlyph />, titleKey: "paywall.previews.numerology.title", captionKey: "paywall.previews.numerology.caption" },
  { key: "matching", kind: "glyph", glyph: <MatchGlyph />, titleKey: "paywall.previews.matching.title", captionKey: "paywall.previews.matching.caption" },
  { key: "friends", kind: "glyph", glyph: <FriendsGlyph />, titleKey: "paywall.previews.friends.title", captionKey: "paywall.previews.friends.caption" },
];

const ROTATE_MS = 3400;

/** Animated top strip of the paywall: a soft-pulsing gold stage crossfading
 *  every few seconds through every flagship premium feature — tarot
 *  spreads lead with the deck's real card art fanned out, the natal chart
 *  gets the actual chart wheel, and the rest get a small glyph — plus
 *  tap-to-jump dots so it isn't purely passive. */
export function PremiumPreviewCarousel() {
  const t = useT();
  const [index, setIndex] = useState(0);
  const pulse = useSharedValue(0.9);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.06, { duration: 2200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const medallionStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const slide = SLIDES[index];
  const isTarot = slide.kind === "tarot";

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.stage, !isTarot && [styles.medallion, medallionStyle]]}>
        <Animated.View key={slide.key} entering={FadeIn.duration(320)} exiting={FadeOut.duration(220)} style={styles.stageContent}>
          {slide.kind === "tarot" ? (
            <TarotFan />
          ) : slide.kind === "chart" ? (
            <NatalWheelSVG size={74} showGlyphs showTicks={false} showInnerChart={false} opacity={0.95} />
          ) : (
            slide.glyph
          )}
        </Animated.View>
      </Animated.View>

      <Animated.View key={`${slide.key}-text`} entering={FadeIn.duration(320)} exiting={FadeOut.duration(180)} style={styles.textWrap}>
        <Text style={styles.title}>{t(slide.titleKey)}</Text>
        <Text style={styles.caption}>{t(slide.captionKey)}</Text>
      </Animated.View>

      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingHorizontal: spacing.lg },
  stage: { height: 100, alignItems: "center", justifyContent: "center" },
  medallion: {
    width: 100,
    borderRadius: radius.pill,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
  },
  stageContent: { alignItems: "center", justifyContent: "center" },
  fanWrap: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  fanCard: { marginHorizontal: -6 },
  textWrap: { alignItems: "center", marginTop: spacing.sm, minHeight: 56 },
  title: { color: colors.gold, fontFamily: typography.h3.fontFamily, fontSize: 17, textAlign: "center" },
  caption: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: spacing.md,
  },
  dots: { flexDirection: "row", gap: 6, marginTop: spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.goldLineHairline },
  dotActive: { backgroundColor: colors.gold },
});
