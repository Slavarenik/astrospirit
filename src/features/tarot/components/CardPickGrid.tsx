import React, { useEffect } from "react";
import { View, Pressable, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { CardBack } from "./CardBack";
import { radius, spacing } from "@shared/theme";

const { width: SCREEN_W } = Dimensions.get("window");
export const GRID_COLUMNS = 3;
const GAP = spacing.sm;
export const CARD_W = (SCREEN_W - spacing.lg * 2 - GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
export const CARD_H = CARD_W * 1.62;

type Props = {
  count: number;
  disabled: boolean;
  selectedIndex: number | null;
  onPick: (index: number) => void;
};

function GridCell({
  index,
  disabled,
  faded,
  onPick,
}: {
  index: number;
  disabled: boolean;
  faded: boolean;
  onPick: (i: number) => void;
}) {
  const bob = useSharedValue(0);
  const fade = useSharedValue(1);

  useEffect(() => {
    bob.value = withDelay(
      index * 60,
      withRepeat(withTiming(1, { duration: 1900 + (index % 5) * 120, easing: Easing.inOut(Easing.sin) }), -1, true)
    );
  }, []);

  useEffect(() => {
    fade.value = withTiming(faded ? 0 : 1, { duration: 320 });
  }, [faded]);

  const style = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [
      { translateY: interpolate(bob.value, [0, 1], [0, -5]) },
      { scale: interpolate(fade.value, [0, 1], [0.85, 1]) },
    ],
  }));

  return (
    <Animated.View style={[styles.cell, style]}>
      <Pressable disabled={disabled} onPress={() => onPick(index)} style={styles.pressable}>
        <CardBack width={CARD_W} height={CARD_H} />
      </Pressable>
    </Animated.View>
  );
}

export function CardPickGrid({ count, disabled, selectedIndex, onPick }: Props) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <GridCell
          key={i}
          index={i}
          disabled={disabled}
          faded={selectedIndex !== null}
          onPick={onPick}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
    justifyContent: "flex-start",
  },
  cell: { width: CARD_W, height: CARD_H, borderRadius: radius.sm, overflow: "hidden" },
  pressable: { flex: 1 },
});
