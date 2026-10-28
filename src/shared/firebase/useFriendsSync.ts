import { useEffect, useRef } from "react";
import { useAuthStore } from "@shared/storage/useAuthStore";
import { useFriendsStore } from "@shared/storage/useFriendsStore";
import { isFirebaseConfigured } from "./firebaseClient";
import { subscribeFriends, upsertFriendRemote } from "./firestoreFriends";

/**
 * Bridges useFriendsStore (local-first, always works offline/guest) with
 * Firestore once both Firebase is configured and the user is signed in.
 * Call this once, high up (App.tsx), alongside useAuthSync.
 *
 * Behavior:
 *  - Signed out, or Firebase not configured yet: no-op — the store stays
 *    exactly as AsyncStorage left it (local-only "guest" friends).
 *  - On the moment of signing in: any friends already in the local store
 *    (added as a guest) are pushed up once, so they aren't lost.
 *  - From then on, Firestore is the source of truth and every snapshot
 *    replaces the local list — so the same account sees the same friends
 *    on a second device too.
 */
export function useFriendsSync() {
  const uid = useAuthStore((s) => s.uid);
  const authResolved = useAuthStore((s) => s.authResolved);
  const hasHydrated = useFriendsStore((s) => s.hasHydrated);
  const pushedLocalRef = useRef(false);

  useEffect(() => {
    // Wait for Firebase Auth (not just the persisted uid cache) — otherwise
    // Firestore sees request.auth == null and rules deny the snapshot.
    if (!uid || !authResolved || !isFirebaseConfigured() || !hasHydrated) {
      useFriendsStore.getState().setSyncedWithCloud(false);
      return;
    }

    if (!pushedLocalRef.current) {
      pushedLocalRef.current = true;
      const local = useFriendsStore.getState().friends;
      Promise.all(local.map((f) => upsertFriendRemote(uid, f))).catch(() => {});
    }

    const unsubscribe = subscribeFriends(uid, (remote) => {
      useFriendsStore.getState().replaceAll(remote);
      useFriendsStore.getState().setSyncedWithCloud(true);
    });

    return () => {
      unsubscribe();
      pushedLocalRef.current = false;
    };
  }, [uid, authResolved, hasHydrated]);
}
