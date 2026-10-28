import React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
  opacity?: number;
};

/** The small 4-pointed star/sparkle glyph used in the corners of ornamental
 *  cards throughout the reference screens (compatibility cards, splash). */
export function CornerSparkle({ size = 10, color = "#C7A55E", opacity = 1 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" opacity={opacity}>
      <Path
        d="M12 2 C12.8 8.2 15.8 11.2 22 12 C15.8 12.8 12.8 15.8 12 22 C11.2 15.8 8.2 12.8 2 12 C8.2 11.2 11.2 8.2 12 2 Z"
        fill={color}
      />
    </Svg>
  );
}
