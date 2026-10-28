import React, { useEffect } from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import Svg, { Path, Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { colors, radius, spacing, typography } from "@shared/theme";
import { CornerSparkle } from "@shared/components";

type Props = {
  label: string;
  description?: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
};

/** Ornamental grid tile matching the reference "Select compatibility
 *  characteristics" cards: tall rounded tile, gold-bordered dark by
 *  default, solid gold with dark text + checkmark badge when selected,
 *  with small corner sparkle flourishes. Laid out in a 2-column wrap by
 *  the parent screen. */
export function ChoiceCard({ label, description, icon, selected, onPress }: Props) {
  const scale = useSharedValue(1);
  const fillProgress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    fillProgress.value = withTiming(selected ? 1 : 0, { duration: 240 });
  }, [selected]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: selected ? colors.gold : colors.goldLineHairline,
    backgroundColor: selected ? colors.gold : colors.bg2,
  }));

  return (
    <Animated.View style={[styles.wrap, animStyle]}>
      <Pressable
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          onPress();
        }}
        onPressIn={() => (scale.value = withSpring(0.96, { damping: 14, stiffness: 300 }))}
        onPressOut={() => (scale.value = withSpring(1, { damping: 10, stiffness: 220 }))}
        style={styles.pressable}
      >
        <View style={styles.cornerTL}>
          <CornerSparkle size={9} color={selected ? colors.textOnAccent : colors.gold} opacity={0.6} />
        </View>
        <View style={styles.cornerBR}>
          <CornerSparkle size={9} color={selected ? colors.textOnAccent : colors.gold} opacity={0.6} />
        </View>

        {icon ? <Text style={[styles.icon, selected && styles.iconSelected]}>{icon}</Text> : null}
        <Text style={[styles.label, selected && styles.labelSelected]}>{label.toUpperCase()}</Text>
        {description ? (
          <Text style={[styles.desc, selected && styles.descSelected]}>{description}</Text>
        ) : null}

        {selected && (
          <View style={styles.checkBadge}>
            <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
              <Path d="M5 13l4 4 10-10" stroke={colors.gold} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    borderWidth: 1.4,
    width: "48%",
    marginBottom: spacing.sm,
  },
  pressable: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.sm,
    minHeight: 140,
  },
  cornerTL: { position: "absolute", top: 10, left: 10 },
  cornerBR: { position: "absolute", bottom: 10, right: 10 },
  icon: { fontSize: 26, marginBottom: spacing.sm, color: colors.gold },
  iconSelected: { color: colors.textOnAccent },
  label: {
    color: colors.textPrimary,
    fontFamily: typography.h3.fontFamily,
    fontSize: 13,
    letterSpacing: 1,
    textAlign: "center",
  },
  labelSelected: { color: colors.textOnAccent },
  desc: {
    color: colors.textTertiary,
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  descSelected: { color: colors.textOnAccent, opacity: 0.75 },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.bg0,
    alignItems: "center",
    justifyContent: "center",
  },
});
