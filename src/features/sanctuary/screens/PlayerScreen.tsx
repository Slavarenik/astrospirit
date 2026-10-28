import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import Svg, { Path, Circle } from "react-native-svg";
import { ScreenBackground, NatalWheelSVG, OrnateFrame } from "@shared/components";
import { colors, radius, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { LIBRARY } from "../data/library";
import { SanctuaryStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<SanctuaryStackParamList, "Player">;

function isGenerated(
  params: Props["route"]["params"]
): params is { generatedTitle: string; lines: string[]; durationMinutes: number } {
  return !!params && "generatedTitle" in params;
}

export function PlayerScreen({ navigation, route }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const generated = isGenerated(route.params) ? route.params : null;
  const trackId = !generated && route.params && "trackId" in route.params ? route.params.trackId : null;
  const track = trackId ? LIBRARY.find((item) => item.id === trackId) : null;

  // Track / session names stay in English; only UI chrome is localized
  const title = generated?.generatedTitle ?? track?.title ?? t("sanctuary.guidedSession");
  const lines = generated?.lines ?? [];
  const durationMinutes = generated?.durationMinutes ?? track?.durationMinutes ?? 5;

  const [playing, setPlaying] = useState(true);
  const [lineIndex, setLineIndex] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const totalSec = durationMinutes * 60;

  const pulse = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.12, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
    rotate.value = withRepeat(withTiming(360, { duration: 40000, easing: Easing.linear }), -1, false);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setElapsedSec((s) => Math.min(s + 1, totalSec));
    }, 1000);
    return () => clearInterval(interval);
  }, [playing, totalSec]);

  useEffect(() => {
    if (!lines.length) return;
    const perLine = Math.max(4, Math.floor(totalSec / lines.length));
    const idx = Math.min(lines.length - 1, Math.floor(elapsedSec / perLine));
    setLineIndex(idx);
  }, [elapsedSec, lines, totalSec]);

  const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotate.value}deg` }] }));

  const progress = totalSec > 0 ? elapsedSec / totalSec : 0;
  const mm = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
  const ss = String(elapsedSec % 60).padStart(2, "0");

  return (
    <ScreenBackground variant="night" showWheel={false}>
      <OrnateFrame />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M6 6l12 12M18 6L6 18" stroke={colors.gold} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </Pressable>
        <Text style={styles.freqBadge}>432 Hz</Text>
      </View>

      <View style={styles.center}>
        <Animated.View style={[styles.wheelBg, ringStyle]} pointerEvents="none">
          <NatalWheelSVG size={320} opacity={0.18} showGlyphs={false} />
        </Animated.View>

        <Animated.View style={[styles.orb, orbStyle]}>
          <Svg width={180} height={180} viewBox="0 0 180 180">
            <Circle cx={90} cy={90} r={88} fill={colors.accentSoft} />
            <Circle cx={90} cy={90} r={60} fill={colors.accent} opacity={0.5} />
            <Circle cx={90} cy={90} r={30} fill={colors.accentGlow} opacity={0.8} />
          </Svg>
        </Animated.View>

        <Text style={styles.title}>{title}</Text>

        {lines.length > 0 && (
          <Animated.View key={lineIndex} entering={FadeIn.duration(500)} style={styles.lineWrap}>
            <Text style={styles.line}>{lines[lineIndex]}</Text>
          </Animated.View>
        )}

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{mm}:{ss}</Text>
          <Text style={styles.timeText}>{durationMinutes}:00</Text>
        </View>

        <Pressable onPress={() => setPlaying((p) => !p)} style={styles.playBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            {playing ? (
              <Path d="M8 5v14M16 5v14" stroke={colors.textOnAccent} strokeWidth={2.6} strokeLinecap="round" />
            ) : (
              <Path d="M7 4l14 8-14 8V4z" fill={colors.textOnAccent} />
            )}
          </Svg>
        </Pressable>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg },
  backBtn: { width: 34, height: 34, justifyContent: "center" },
  freqBadge: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
    borderWidth: 1,
    borderColor: colors.goldLine,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl, gap: spacing.md },
  wheelBg: { position: "absolute" },
  orb: { alignItems: "center", justifyContent: "center" },
  title: { color: colors.gold, fontFamily: typography.h1.fontFamily, fontSize: 22, textAlign: "center", marginTop: spacing.sm, letterSpacing: 0.6 },
  lineWrap: { minHeight: 60, justifyContent: "center" },
  line: { color: colors.textSecondary, fontFamily: typography.bodyLg.fontFamily, fontSize: 15.5, lineHeight: 23, textAlign: "center" },
  progressTrack: { width: "100%", height: 3, borderRadius: 2, backgroundColor: colors.bg3, marginTop: spacing.md },
  progressFill: { height: 3, borderRadius: 2, backgroundColor: colors.accent },
  timeRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 6 },
  timeText: { color: colors.textTertiary, fontSize: 11, fontFamily: typography.caption.fontFamily },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
});
