import { AspectType } from "@shared/utils/astrology";

/** One explanation per aspect TYPE (not per specific planet pair — 45
 *  possible pairs × 5 types would be excessive for what a type-level read
 *  already covers well). English-source, localized live via
 *  `useTranslatedTexts` on `AspectsScreen`, same convention as the rest of
 *  this app's generated/explanatory content. */
export const ASPECT_EXPLANATION: Record<AspectType, string> = {
  conjunction:
    "A conjunction fuses the two planets' energies into one — they act almost as a single force rather than two separate influences. Powerful and concentrated, for better or worse depending on the planets involved.",
  sextile:
    "A sextile is an easy, supportive link — the two planets cooperate without much friction, offering a natural opportunity rather than a demand. It takes a little initiative to use well, but rarely causes tension.",
  square:
    "A square is a friction point — the two planets pull in different directions, creating pressure that usually forces growth through challenge rather than comfort. Productive tension, if it's worked with rather than avoided.",
  trine:
    "A trine is the most naturally flowing connection — the two planets' energies reinforce each other with little effort. Talent and ease, though it can also mean a strength that's taken for granted and underused.",
  opposition:
    "An opposition stretches the two planets across from each other — a push-pull that calls for balance rather than letting one side dominate. Often experienced as an internal tug-of-war until it's consciously reconciled.",
};
