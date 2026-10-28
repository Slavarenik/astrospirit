import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithCredential,
  getAdditionalUserInfo,
  OAuthProvider,
  GoogleAuthProvider,
  User,
} from "firebase/auth";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import Constants from "expo-constants";
import { getFirebaseAuth, isFirebaseConfigured } from "./firebaseClient";
import { logSignUp, logLogin } from "@shared/analytics/analytics";
import { linkAuthToDeviceProfile } from "./firestoreUsers";

export type AuthErrorCode =
  | "invalidEmail"
  | "weakPassword"
  | "wrongPassword"
  | "emailInUse"
  | "userNotFound"
  | "notConfigured"
  | "generic";

export class AuthActionError extends Error {
  code: AuthErrorCode;
  constructor(code: AuthErrorCode) {
    super(code);
    this.code = code;
  }
}

/** Thrown when the person backs out of the native Apple/Google sheet —
 *  distinct from AuthActionError so callers can treat it as a silent no-op
 *  instead of showing an error message. */
export class OAuthCancelledError extends Error {}

/** Maps a Firebase Auth error (or "not configured yet") to one of the
 *  translated strings under auth.error.* — screens never see raw Firebase
 *  error codes. */
function mapAuthError(err: unknown): AuthActionError {
  const code = (err as { code?: string } | null)?.code ?? "";
  switch (code) {
    case "auth/invalid-email":
      return new AuthActionError("invalidEmail");
    case "auth/weak-password":
      return new AuthActionError("weakPassword");
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return new AuthActionError("wrongPassword");
    case "auth/email-already-in-use":
      return new AuthActionError("emailInUse");
    case "auth/user-not-found":
      return new AuthActionError("userNotFound");
    default:
      return new AuthActionError("generic");
  }
}

function assertConfigured() {
  if (!isFirebaseConfigured()) throw new AuthActionError("notConfigured");
}

export async function signUpWithEmail(email: string, password: string): Promise<User> {
  assertConfigured();
  try {
    const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    logSignUp("password");
    linkAuthToDeviceProfile(cred.user.uid, cred.user.email, "password");
    return cred.user;
  } catch (err) {
    throw mapAuthError(err);
  }
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  assertConfigured();
  try {
    const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    logLogin("password");
    linkAuthToDeviceProfile(cred.user.uid, cred.user.email, "password");
    return cred.user;
  } catch (err) {
    throw mapAuthError(err);
  }
}

export async function signOutUser(): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    await firebaseSignOut(getFirebaseAuth());
  } catch (err) {
    throw mapAuthError(err);
  }
}

/** Subscribes to Firebase Auth's user state. No-ops (fires once with null)
 *  when Firebase isn't configured, so callers never need to branch on
 *  isFirebaseConfigured() themselves. Returns an unsubscribe function. */
export function subscribeAuthState(callback: (user: User | null) => void): () => void {
  if (!isFirebaseConfigured()) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

/** True on a device that can present the native Apple sign-in sheet
 *  (iOS 13+ only — AuthScreen uses this to hide the button on Android). */
export async function isAppleSignInAvailable(): Promise<boolean> {
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

function readGoogleWebClientId(): string {
  const extra = (Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {}) as {
    googleWebClientId?: string;
  };
  return extra.googleWebClientId ?? "";
}

let googleSignInConfigured = false;
function ensureGoogleSignInConfigured() {
  if (googleSignInConfigured) return;
  GoogleSignin.configure({ webClientId: readGoogleWebClientId() });
  googleSignInConfigured = true;
}

/** Native "Sign in with Apple". Uses a random nonce (hashed with SHA-256
 *  before being sent to Apple, raw version sent to Firebase) as recommended
 *  by both Apple and Firebase to prevent replay attacks. */
export async function signInWithApple(): Promise<User> {
  assertConfigured();

  const rawNonce = Array.from(await Crypto.getRandomBytesAsync(16))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);

  let appleCredential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    appleCredential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
  } catch (err) {
    if ((err as { code?: string } | null)?.code === "ERR_REQUEST_CANCELED") throw new OAuthCancelledError();
    throw new AuthActionError("generic");
  }
  if (!appleCredential.identityToken) throw new AuthActionError("generic");

  try {
    const provider = new OAuthProvider("apple.com");
    const credential = provider.credential({ idToken: appleCredential.identityToken, rawNonce });
    const result = await signInWithCredential(getFirebaseAuth(), credential);
    const isNewUser = getAdditionalUserInfo(result)?.isNewUser ?? false;
    if (isNewUser) logSignUp("apple.com");
    else logLogin("apple.com");
    linkAuthToDeviceProfile(result.user.uid, result.user.email, "apple.com");
    return result.user;
  } catch (err) {
    throw mapAuthError(err);
  }
}

/** Native Google Sign-In via @react-native-google-signin/google-signin.
 *  Requires EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in .env (Firebase's
 *  auto-created "Web client", not the iOS client id in
 *  GoogleService-Info.plist) — see .env.example. */
export async function signInWithGoogle(): Promise<User> {
  assertConfigured();
  ensureGoogleSignInConfigured();

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  } catch {
    // No Play Services check on iOS; on Android without services the
    // signIn() call below fails with a clearer, user-facing error anyway.
  }

  let idToken: string | null | undefined;
  try {
    const signInResult = await GoogleSignin.signIn();
    // v13's payload is nested under `.data`; read both shapes defensively
    // in case the installed version differs.
    const data =
      (signInResult as { data?: { idToken?: string | null } }).data ??
      (signInResult as { idToken?: string | null });
    idToken = data?.idToken;
  } catch (err) {
    if ((err as { code?: string } | null)?.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new OAuthCancelledError();
    }
    throw new AuthActionError("generic");
  }
  if (!idToken) throw new AuthActionError("generic");

  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(getFirebaseAuth(), credential);
    const isNewUser = getAdditionalUserInfo(result)?.isNewUser ?? false;
    if (isNewUser) logSignUp("google.com");
    else logLogin("google.com");
    linkAuthToDeviceProfile(result.user.uid, result.user.email, "google.com");
    return result.user;
  } catch (err) {
    throw mapAuthError(err);
  }
}
