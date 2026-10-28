import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { colors, spacing } from "@shared/theme";

type Props = {
  total: number;
  activeIndex: number;
};

function Dot({ active }: { active: boolean }) {
  const width = useSharedValue(active ? 22 : 8);
  const opacity = useSharedValue(active ? 1 : 0.35);

  useEffect(() => {
    width.value = withTiming(active ? 22 : 8, { duration: 280 });
    opacity.value = withTiming(active ? 1 : 0.35, { duration: 280 });
  }, [active]);

  const style = useAnimatedStyle(() => ({ width: width.value, opacity: opacity.value }));
  return <Animated.View style={[styles.dot, style]} />;
}

export function ProgressDots({ total, activeIndex }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} active={i === activeIndex} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.xxs, alignItems: "center" },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
});
