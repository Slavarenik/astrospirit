import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "./firebaseClient";
import { getDeviceId } from "@shared/utils/deviceId";
import { UserProfile } from "@shared/types/user";

/**
 * `Users/{deviceId}` (capital U — deliberately a different collection from
 * the lowercase `users/{uid}` the Friends feature already uses) holds one
 * document per install, keyed by the random id from
 * `shared/utils/deviceId.ts` — not the Firebase Auth uid, because this
 * needs to exist *before* anyone signs in (right after onboarding).
 *
 * Flow:
 *  1. Onboarding completes → syncProfileToFirestore() upserts the profile
 *     under Users/{deviceId}. No auth required.
 *  2. The person signs up/in (any method) → linkAuthToDeviceProfile() looks
 *     that same document back up by deviceId and merges in the Firebase
 *     Auth identity (uid/email/method), instead of creating a second,
 *     orphaned record under the uid.
 *
 * Both are best-effort: failures are swallowed so this reporting pipe never
 * blocks onboarding or sign-in, which both work the same without it
 * (everything authoritative stays in useUserStore/useAuthStore locally).
 */

const COLLECTION = "Users";

export async function syncProfileToFirestore(profile: UserProfile): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const deviceId = await getDeviceId();
    const ref_ = doc(getFirebaseDb(), COLLECTION, deviceId);
    const existing = await getDoc(ref_);
    await setDoc(
      ref_,
      {
        deviceId,
        name: profile.name,
        gender: profile.gender,
        birthDate: profile.birthDate,
        birthTime: profile.birthTime,
        birthCity: profile.birthCity,
        birthLat: profile.birthLat,
        birthLon: profile.birthLon,
        birthTimezone: profile.birthTimezone,
        relationshipStatus: profile.relationshipStatus,
        sunSign: profile.sunSign,
        onboardingComplete: profile.onboardingComplete,
        createdAt: existing.exists() ? existing.data()?.createdAt ?? serverTimestamp() : serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // Best-effort reporting — see module note above.
  }
}

export async function linkAuthToDeviceProfile(
  uid: string,
  email: string | null,
  method: "password" | "apple.com" | "google.com"
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const deviceId = await getDeviceId();
    const ref_ = doc(getFirebaseDb(), COLLECTION, deviceId);
    await setDoc(
      ref_,
      {
        deviceId,
        uid,
        email,
        authMethod: method,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // Best-effort reporting — see module note above.
  }
}
