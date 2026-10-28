import analytics from "@react-native-firebase/analytics";

/**
 * Thin wrapper around @react-native-firebase/analytics so the rest of the
 * app never touches the native module directly.
 *
 * Why @react-native-firebase and not the `firebase` JS SDK already used
 * for Auth/Firestore (see firebaseClient.ts): Firebase JS SDK's
 * `firebase/analytics` is built for the web (it needs a DOM/`window` and
 * reports via gtag) and does not actually collect events in React Native.
 * `@react-native-firebase/analytics` is the real native SDK, and it's what
 * the `GoogleService-Info.plist` you added is for — it auto-registers
 * `first_open` (and session/screen-view events) with no code needed here.
 *
 * Native module caveat: this package ships native iOS/Android code, so it
 * only works once the project is built with a custom dev client / EAS
 * Build — it is NOT available in plain Expo Go. Every call below is
 * wrapped in try/catch and fails silently so the app keeps working in Expo
 * Go during day-to-day development instead of crashing on a missing
 * native module.
 */

async function safeLog(fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
  } catch {
    // No native Analytics module linked yet (e.g. running in Expo Go, or
    // before the first EAS/dev-client build) — ignore.
  }
}

/**
 * first_open is logged automatically by the native Firebase Analytics SDK
 * the first time the app launches after install — there is nothing to call
 * here. Exported as a no-op so call sites can still reference the event by
 * name if that's ever useful (e.g. for a debug log).
 */
export function logFirstOpen(): void {}

export type ShareBlock = "horoscope" | "tarot" | "affirmation";

/** My Day → sharing the horoscope / card-of-day / affirmation block as an image. */
export function logShareBlock(block: ShareBlock): Promise<void> {
  return safeLog(() =>
    analytics().logShare({ content_type: block, item_id: block, method: "image" })
  );
}

/** A daily spiritual tracker (Calendar tab) was checked off as done.
 *  `allDoneToday` is true when this completion finished the full set for today. */
export function logTrackerCompleted(trackerId: string, allDoneToday: boolean): Promise<void> {
  return safeLog(() =>
    analytics().logEvent("tracker_completed", {
      tracker_id: trackerId,
      all_done_today: allDoneToday,
    })
  );
}

/** Onboarding flow finished and the user's profile was created. */
export function logOnboardingComplete(): Promise<void> {
  return safeLog(() => analytics().logEvent("onboarding_complete"));
}

export type AuthMethod = "password" | "apple.com" | "google.com";

/** New account created (email/password sign-up, or Apple/Google once wired). */
export function logSignUp(method: AuthMethod): Promise<void> {
  return safeLog(() => analytics().logSignUp({ method }));
}

/** Existing user signed in (email/password, or Apple/Google once wired). */
export function logLogin(method: AuthMethod): Promise<void> {
  return safeLog(() => analytics().logLogin({ method }));
}

/**
 * Premium subscription purchased. Call this from the real IAP
 * purchase-success callback (App Store / Play receipt validated via
 * RevenueCat/StoreKit or similar) once that's wired up — not from the
 * current Paywall stub, which doesn't charge anything yet.
 */
export function logPurchase(planId: string, value: number, currency: string): Promise<void> {
  return safeLog(() =>
    analytics().logPurchase({ value, currency, items: [{ item_id: planId }] })
  );
}
