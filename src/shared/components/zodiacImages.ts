import { ImageSourcePropType } from "react-native";
import { ZodiacSign } from "@shared/theme";

/** White-on-transparent line-art glyphs for each zodiac sign — tintable via Image tintColor. */
export const ZODIAC_IMAGES: Record<ZodiacSign, ImageSourcePropType> = {
  Aries: require("@assets/zodiac/aries.png"),
  Taurus: require("@assets/zodiac/taurus.png"),
  Gemini: require("@assets/zodiac/gemini.png"),
  Cancer: require("@assets/zodiac/cancer.png"),
  Leo: require("@assets/zodiac/leo.png"),
  Virgo: require("@assets/zodiac/virgo.png"),
  Libra: require("@assets/zodiac/libra.png"),
  Scorpio: require("@assets/zodiac/scorpio.png"),
  Sagittarius: require("@assets/zodiac/sagittarius.png"),
  Capricorn: require("@assets/zodiac/capricorn.png"),
  Aquarius: require("@assets/zodiac/aquarius.png"),
  Pisces: require("@assets/zodiac/pisces.png"),
};
