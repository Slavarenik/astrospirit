import { ZodiacSign } from "@shared/theme";

/**
 * A friend added for compatibility comparison. Deliberately minimal (no
 * birth time/city) — unlike the user's own onboarding profile, friends are
 * added quickly from memory, so natal-chart extras (ascendant) fall back to
 * the same noon default AstroPassportCard already uses when time is unknown.
 *
 * Local-only by default (persisted via useFriendsStore/AsyncStorage) so the
 * feature works with no backend at all. Once Firebase is configured *and*
 * the user is signed in (not a guest), useFriendsSync mirrors this list
 * to/from Firestore at `users/{uid}/friends/{id}` — see FIRESTORE_SCHEMA.md.
 */
export type Friend = {
  id: string;
  name: string;
  /** ISO date, "YYYY-MM-DD" — no time component. */
  birthDate: string;
  sunSign: ZodiacSign;
  /** ISO timestamp of when the friend was added. */
  createdAt: string;
};

export type NewFriendInput = Pick<Friend, "name" | "birthDate" | "sunSign">;
