import React, { useEffect } from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { CardBack } from "./CardBack";
import { CARD_W, CARD_H } from "./CardPickGrid";
import { TarotCard } from "../data/tarotCatalog";
import { CARD_IMAGES } from "../data/cardImages";
import { colors, radius } from "@shared/theme";

const { width: SCREEN_W } = Dimensions.get("window");

const BIG_W = CARD_W * 2.05;
const BIG_H = CARD_H * 2.05;
const DOCK_W = CARD_W * 1.15;

type Props = {
  card: TarotCard;
  reversed: boolean;
  onDocked?: () => void;
};

/** Animates a single picked card: flip face-up center-screen, then shrink
 *  and glide to a docked position near the top of the screen. */
export function DrawnCardReveal({ card, reversed, onDocked }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSequence(
      withTiming(0.5, { duration: 480, easing: Easing.out(Easing.quad) }),
      withDelay(
        260,
        withTiming(1, { duration: 620, easing: Easing.inOut(Easing.cubic) }, (finished) => {
          if (finished && onDocked) runOnJS(onDocked)();
        })
      )
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 0.5, 1], [1, 1, DOCK_W / BIG_W]);
    const translateY = interpolate(progress.value, [0.5, 1], [0, -SCREEN_W * 0.62], "clamp");
    return {
      transform: [{ scale }, { translateY }],
    };
  });

  const flipStyle = useAnimatedStyle(() => {
    // Both are only defined over the flip's own span, progress 0→0.5 — the
    // sequence keeps animating progress past that (0.5→1 is the shrink-and-
    // dock phase). Without "clamp", reanimated's default extrapolation
    // keeps extending each curve past its last breakpoint using that
    // segment's slope, so scaleX (sloping steeply back up from 0.05 to 1
    // between 0.25 and 0.5) kept climbing well past 1 for the rest of the
    // animation — the horizontal "stretch" visible while the card glides
    // to its docked spot. Clamping holds both at their flip-complete values
    // (180°, scaleX 1) once progress passes 0.5.
    const rotate = interpolate(progress.value, [0, 0.25, 0.5], [0, 90, 180], "clamp");
    const scaleX = interpolate(progress.value, [0, 0.25, 0.5], [1, 0.05, 1], "clamp");
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotate}deg` }, { scaleX }],
    };
  });

  const backOpacity = useAnimatedStyle(() => ({
    opacity: progress.value < 0.25 ? 1 : 0,
  }));
  const frontOpacity = useAnimatedStyle(() => ({
    opacity: progress.value >= 0.25 ? 1 : 0,
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.cardAnchor, containerStyle]}>
        <Animated.View style={[{ width: BIG_W, height: BIG_H }, flipStyle]}>
          <Animated.View style={[StyleSheet.absoluteFill, backOpacity]}>
            <CardBack width={BIG_W} height={BIG_H} />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, frontOpacity, styles.frontFace]}>
            <Image
              source={CARD_IMAGES[card.id]}
              style={[
                styles.image,
                { width: BIG_W, height: BIG_H, transform: reversed ? [{ rotate: "180deg" }] : undefined },
              ]}
              resizeMode="cover"
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  cardAnchor: { alignItems: "center", justifyContent: "center" },
  frontFace: { borderRadius: radius.sm, overflow: "hidden" },
  image: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.goldLine,
  },
});
