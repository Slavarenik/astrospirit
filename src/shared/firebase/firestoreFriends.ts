import { collection, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "./firebaseClient";
import { Friend } from "@shared/types/friend";

/**
 * Firestore-backed mirror of a user's friends list, at
 * `users/{uid}/friends/{friendId}` — see FIRESTORE_SCHEMA.md for the full
 * schema (this is the only collection this app writes to so far; `users`
 * document fields are left for the user's own planned Firestore setup).
 * Every function here is a no-op (or throws only if awaited without
 * checking) when Firebase isn't configured — always gate calls with
 * isFirebaseConfigured() first, same as the rest of the Firebase layer.
 */

function friendsCollection(uid: string) {
  return collection(getFirebaseDb(), "users", uid, "friends");
}

/** Subscribes to a user's friends collection. Returns an unsubscribe
 *  function. Call only when isFirebaseConfigured() is true. */
export function subscribeFriends(uid: string, onChange: (friends: Friend[]) => void): () => void {
  return onSnapshot(
    friendsCollection(uid),
    (snap) => {
      const friends: Friend[] = snap.docs.map((d) => {
        const data = d.data() as Omit<Friend, "id">;
        return { id: d.id, ...data };
      });
      onChange(friends);
    },
    (error) => {
      // Common while rules are not deployed yet, or auth briefly lags —
      // keep local friends instead of throwing an uncaught listener error.
      console.warn("[firestoreFriends] snapshot failed:", error.code, error.message);
    }
  );
}

export async function upsertFriendRemote(uid: string, friend: Friend): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const ref = doc(friendsCollection(uid), friend.id);
  await setDoc(ref, {
    name: friend.name,
    birthDate: friend.birthDate,
    sunSign: friend.sunSign,
    createdAt: friend.createdAt,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteFriendRemote(uid: string, friendId: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await deleteDoc(doc(friendsCollection(uid), friendId));
}
