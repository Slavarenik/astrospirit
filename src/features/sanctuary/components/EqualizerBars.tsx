import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from "react-native-reanimated";
import { colors } from "@shared/theme";

function Bar({ delay }: { delay: number }) {
  const h = useSharedValue(0.3);
  useEffect(() => {
    h.value = withRepeat(
      withTiming(1, { duration: 420 + delay, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);
  const style = useAnimatedStyle(() => ({ height: 4 + h.value * 12 }));
  return <Animated.View style={[styles.bar, style]} />;
}

/** Small animated "now playing" equalizer indicator. */
export function EqualizerBars() {
  return (
    <View style={styles.row}>
      <Bar delay={0} />
      <Bar delay={140} />
      <Bar delay={260} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", gap: 3, height: 16 },
  bar: { width: 3, borderRadius: 2, backgroundColor: colors.accent },
});
