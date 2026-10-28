import React, { useEffect } from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing, interpolate } from "react-native-reanimated";
import { CardBack } from "./CardBack";
import { TarotCard } from "../data/tarotCatalog";
import { CARD_IMAGES } from "../data/cardImages";
import { colors, radius } from "@shared/theme";

type Props = {
  width: number;
  height: number;
  card: TarotCard | null; // null until this position is picked
  reversed: boolean;
  onPress: () => void;
};

/** One spread position. Unlike DrawnCardReveal (a single big card that flies
 *  to a dock), every spread slot stays put in its own fixed layout spot, so
 *  this only needs the flip itself — no travel/scale-dock phase. Same
 *  clamped rotateY/scaleX technique as DrawnCardReveal's flip, just without
 *  the shrink-and-glide half of that animation. */
export function SpreadSlot({ width, height, card, reversed, onPress }: Props) {
  const flip = useSharedValue(0);

  useEffect(() => {
    // "New spread" resets the slot's `card` back to null without remounting
    // this component (same key, just a prop change) — without this branch,
    // `flip` stayed at 1 from the previous reveal, so both faces ended up
    // invisible: backOpacity (flip < 0.5) was false, and the front face had
    // no card to render. Snapping back to 0 (no animation needed, it's
    // already face-down-looking by then) brings the card back into view.
    if (card) {
      flip.value = withTiming(1, { duration: 480, easing: Easing.inOut(Easing.cubic) });
    } else {
      flip.value = 0;
    }
  }, [card]);

  const flipStyle = useAnimatedStyle(() => {
    const rotate = interpolate(flip.value, [0, 0.5, 1], [0, 90, 180], "clamp");
    const scaleX = interpolate(flip.value, [0, 0.5, 1], [1, 0.05, 1], "clamp");
    return { transform: [{ perspective: 1200 }, { rotateY: `${rotate}deg` }, { scaleX }] };
  });
  const backOpacity = useAnimatedStyle(() => ({ opacity: flip.value < 0.5 ? 1 : 0 }));
  const frontOpacity = useAnimatedStyle(() => ({ opacity: flip.value >= 0.5 ? 1 : 0 }));

  return (
    // Stays pressable after reveal too — the caller's onPress decides
    // whether a tap picks the card (face-down) or opens the full-screen
    // viewer (face-up); this component no longer disables itself once a
    // card is set.
    <Pressable onPress={onPress} style={{ width, height }}>
      <Animated.View style={[{ width, height }, flipStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, backOpacity]}>
          <CardBack width={width} height={height} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, frontOpacity, styles.frontFace]}>
          {card && (
            <Image
              source={CARD_IMAGES[card.id]}
              style={[styles.image, { width, height, transform: reversed ? [{ rotate: "180deg" }] : undefined }]}
              resizeMode="cover"
            />
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  frontFace: { borderRadius: radius.sm, overflow: "hidden" },
  image: { borderRadius: radius.sm, borderWidth: 1, borderColor: colors.goldLine },
});
