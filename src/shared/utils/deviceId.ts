import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const STORAGE_KEY = "astrospirit/device-id";

let cached: string | null = null;

/**
 * A random UUID generated once per install and persisted to AsyncStorage —
 * not a hardware identifier (no permission prompt, no reliance on iOS'
 * identifierForVendor resetting behavior). This is the key the app uses to
 * report onboarding data to Firestore's `Users` collection before anyone
 * has signed in, and to re-attach that record once they do.
 */
export async function getDeviceId(): Promise<string> {
  if (cached) return cached;
  const existing = await AsyncStorage.getItem(STORAGE_KEY);
  if (existing) {
    cached = existing;
    return existing;
  }
  const id = Crypto.randomUUID();
  await AsyncStorage.setItem(STORAGE_KEY, id);
  cached = id;
  return id;
}
