import { ZodiacSign } from "@shared/theme";

export type Gender = "Female" | "Male" | "Non-binary" | "Prefer not to say";

export type RelationshipStatus =
  | "Soulmate"
  | "Engaged"
  | "Married"
  | "Difficult"
  | "Single";

export type UserProfile = {
  name: string;
  gender: Gender;
  birthDate: string; // ISO yyyy-MM-dd
  birthTime: string | null; // HH:mm, optional
  birthCity: string | null;
  /** Geocoded from birthCity (natal-chart Stage 2) — null until resolved.
   *  See src/shared/utils/geocoding.ts. All three are set together or not
   *  at all; never assume one is present without the others. */
  birthLat: number | null;
  birthLon: number | null;
  /** IANA zone name at the geocoded location, e.g. "Europe/Kyiv". Used to
   *  resolve the correct historical UTC offset for the birth date/time —
   *  see buildPreciseBirthInstant() in astrology.ts. */
  birthTimezone: string | null;
  relationshipStatus: RelationshipStatus;
  sunSign: ZodiacSign;
  onboardingComplete: boolean;
};

export const RELATIONSHIP_STATUSES: RelationshipStatus[] = [
  "Soulmate",
  "Engaged",
  "Married",
  "Difficult",
  "Single",
];

export const GENDERS: Gender[] = ["Female", "Male", "Non-binary", "Prefer not to say"];
