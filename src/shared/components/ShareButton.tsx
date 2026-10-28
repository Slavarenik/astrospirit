import React from "react";
import { Pressable, ActivityIndicator, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "@shared/theme";

type Props = {
  onPress: () => void;
  busy?: boolean;
  size?: number;
};

/** Small circular share-icon button for My Day's shareable blocks
 *  (horoscope, tarot card of the day, affirmation) — pair it with a
 *  ViewShot ref in the parent that wraps the content to capture, and call
 *  expo-sharing on the resulting image URI from onPress. */
export function ShareButton({ onPress, busy, size = 30 }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={[styles.btn, { width: size, height: size, borderRadius: size / 2 }]}
      hitSlop={8}
    >
      {busy ? (
        <ActivityIndicator size="small" color={colors.gold} />
      ) : (
        <Svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
          <Path d="M12 3v12M12 3l-4 4M12 3l4 4" stroke={colors.gold} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4" stroke={colors.gold} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
  },
});
