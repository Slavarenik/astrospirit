import React from "react";
import { Image } from "react-native";
import { radius } from "@shared/theme";

type Props = { width: number; height: number };

const CARD_BACK_IMAGE = require("@assets/tarot/card-back.png");

/** The face-down card design — the deck's own illustrated back (a radiant
 *  moon motif), swapped in for the previous hand-drawn natal-wheel SVG. */
export function CardBack({ width, height }: Props) {
  return <Image source={CARD_BACK_IMAGE} style={{ width, height, borderRadius: radius.sm }} resizeMode="cover" />;
}
