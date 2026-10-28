import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, { FadeIn, Layout } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GlassCard, FadeInUp, SectionHeader } from "@shared/components";
import { colors, radius, spacing, typography } from "@shared/theme";
import { useT, useTranslatedTexts } from "@shared/i18n";
import { LIBRARY, CATEGORY_ORDER, LibraryItem } from "../data/library";
import { EqualizerBars } from "./EqualizerBars";
import { BreathingCircle } from "./BreathingCircle";
import { usePremiumStore } from "@shared/storage/usePremiumStore";
import { usePaywallNavigation } from "@shared/hooks/usePaywallNavigation";
import { SanctuaryStackParamList } from "@app/navigation/types";

const PATTERNS: Record<string, [number, number, number, number]> = {
  "box-breathing": [4, 4, 4, 4],
  "478-breathing": [4, 7, 8, 1],
};

function PlayIcon({ playing }: { playing: boolean }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      {playing ? (
        <>
          <Path d="M8 5v14M16 5v14" stroke={colors.accent} strokeWidth={2.4} strokeLinecap="round" />
        </>
      ) : (
        <Path d="M7 4l14 8-14 8V4z" fill={colors.textPrimary} />
      )}
    </Svg>
  );
}

function LockIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path d="M6 11V8a6 6 0 1112 0v3" stroke={colors.textTertiary} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M5 11h14v9H5z" stroke={colors.textTertiary} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function LibraryRow({
  item,
  subtitle,
  playing,
  expanded,
  onToggle,
}: {
  item: LibraryItem;
  subtitle: string;
  playing: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isBreathwork = item.category === "Breathwork";

  return (
    <Animated.View layout={Layout.springify()}>
      <Pressable onPress={onToggle} style={styles.row}>
        <View style={[styles.playDot, playing && styles.playDotActive]}>
          <PlayIcon playing={playing} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            {/* Track names stay in English by design */}
            <Text style={styles.itemTitle}>{item.title}</Text>
            {item.premium && <LockIcon />}
          </View>
          <Text style={styles.itemSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.rightCol}>
          {playing && !isBreathwork ? <EqualizerBars /> : (
            <Text style={styles.duration}>{item.durationMinutes}m</Text>
          )}
        </View>
      </Pressable>
      {isBreathwork && expanded && (
        <Animated.View entering={FadeIn} style={styles.breathWrap}>
          <BreathingCircle pattern={PATTERNS[item.id] ?? [4, 4, 4, 4]} size={140} />
        </Animated.View>
      )}
    </Animated.View>
  );
}

export function LibraryList() {
  const t = useT();
  const navigation = useNavigation<NativeStackNavigationProp<SanctuaryStackParamList>>();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const goToPaywall = usePaywallNavigation();

  const englishSubtitles = useMemo(() => LIBRARY.map((i) => i.subtitle), []);
  const { texts: localizedSubtitles } = useTranslatedTexts(englishSubtitles);
  const subtitleById = useMemo(() => {
    const map: Record<string, string> = {};
    LIBRARY.forEach((item, i) => {
      map[item.id] = localizedSubtitles[i] ?? item.subtitle;
    });
    return map;
  }, [localizedSubtitles]);

  const handleToggle = (item: LibraryItem) => {
    if (item.premium && !isPremium) {
      goToPaywall();
      return;
    }
    if (item.category === "Breathwork") {
      setPlayingId((cur) => (cur === item.id ? null : item.id));
      return;
    }
    setPlayingId(item.id);
    navigation.navigate("Player", { trackId: item.id });
  };

  return (
    <FadeInUp delay={150}>
      <GlassCard sparkles>
        <SectionHeader title={t("sanctuary.libraryTitle")} subtitle={t("sanctuary.librarySubtitle")} />
        {CATEGORY_ORDER.map((cat) => (
          <View key={cat} style={styles.category}>
            <Text style={styles.categoryLabel}>{t(`sanctuary.categories.${cat}`)}</Text>
            {LIBRARY.filter((i) => i.category === cat).map((item) => (
              <LibraryRow
                key={item.id}
                item={item}
                subtitle={subtitleById[item.id] ?? item.subtitle}
                playing={playingId === item.id}
                expanded={playingId === item.id}
                onToggle={() => handleToggle(item)}
              />
            ))}
          </View>
        ))}
      </GlassCard>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  category: { marginTop: spacing.sm },
  categoryLabel: {
    color: colors.textTertiary,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xs },
  playDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  playDotActive: { backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.goldLine },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  itemTitle: { color: colors.textPrimary, fontFamily: typography.body.fontFamily, fontSize: 14.5, fontWeight: "600" },
  itemSubtitle: { color: colors.textTertiary, fontFamily: typography.caption.fontFamily, fontSize: 12, marginTop: 1 },
  rightCol: { minWidth: 36, alignItems: "flex-end" },
  duration: { color: colors.textTertiary, fontFamily: typography.caption.fontFamily, fontSize: 12 },
  breathWrap: { alignItems: "center", paddingVertical: spacing.md },
});
