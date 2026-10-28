import { useEffect } from "react";
import { useAuthStore } from "@shared/storage/useAuthStore";
import { subscribeAuthState } from "./authActions";

/** Keeps useAuthStore in sync with Firebase Auth's own state. Call this
 *  once, high up (App.tsx) — it fires immediately (with null) when
 *  Firebase isn't configured, so the rest of the app can treat "no uid"
 *  and "Firebase not set up" the same way: guest mode. */
export function useAuthSync() {
  useEffect(() => {
    const unsubscribe = subscribeAuthState((user) => {
      useAuthStore.getState().setUser(user ? { uid: user.uid, email: user.email } : null);
      useAuthStore.getState().setAuthResolved(true);
    });
    return unsubscribe;
  }, []);
}
