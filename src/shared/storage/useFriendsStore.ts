import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { asyncStorageAdapter } from "./persist";
import { Friend, NewFriendInput } from "@shared/types/friend";

type FriendsState = {
  friends: Friend[];
  hasHydrated: boolean;
  /** True once useFriendsSync has taken over from Firestore (signed in +
   *  Firebase configured) — lets the UI show "synced" vs "local only". */
  syncedWithCloud: boolean;
  setHasHydrated: (v: boolean) => void;
  setSyncedWithCloud: (v: boolean) => void;
  addFriend: (input: NewFriendInput) => Friend;
  removeFriend: (id: string) => void;
  /** Replaces the whole list — used by useFriendsSync when Firestore is the
   *  source of truth, and never called directly from screens. */
  replaceAll: (friends: Friend[]) => void;
};

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useFriendsStore = create<FriendsState>()(
  persist(
    (set, get) => ({
      friends: [],
      hasHydrated: false,
      syncedWithCloud: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      setSyncedWithCloud: (v) => set({ syncedWithCloud: v }),
      addFriend: (input) => {
        const friend: Friend = { id: makeId(), createdAt: new Date().toISOString(), ...input };
        set({ friends: [...get().friends, friend] });
        return friend;
      },
      removeFriend: (id) => set({ friends: get().friends.filter((f) => f.id !== id) }),
      replaceAll: (friends) => set({ friends }),
    }),
    {
      name: "astrospirit/friends",
      storage: createJSONStorage(() => asyncStorageAdapter),
      partialize: (state) => ({ friends: state.friends }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
