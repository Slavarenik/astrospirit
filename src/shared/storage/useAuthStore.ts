import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { asyncStorageAdapter } from "./persist";

type AuthState = {
  /** Mirrors Firebase Auth's current user — null when signed out OR when
   *  Firebase isn't configured yet (the whole feature degrades to guest). */
  uid: string | null;
  email: string | null;
  /** True once Firebase Auth has reported its first state (so the UI can
   *  avoid flashing "signed out" for a moment on cold start). */
  authResolved: boolean;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setUser: (user: { uid: string; email: string | null } | null) => void;
  setAuthResolved: (v: boolean) => void;
};

/** Small persisted slice of Firebase Auth state, kept in sync by
 *  useAuthSync (subscribed once in App.tsx). Persisting it means the
 *  "signed in as ..." UI can render instantly from cache on next launch,
 *  before Firebase's own onAuthStateChanged has had a chance to fire. */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      uid: null,
      email: null,
      authResolved: false,
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      setUser: (user) => set({ uid: user?.uid ?? null, email: user?.email ?? null }),
      setAuthResolved: (v) => set({ authResolved: v }),
    }),
    {
      name: "astrospirit/auth",
      storage: createJSONStorage(() => asyncStorageAdapter),
      partialize: (state) => ({ uid: state.uid, email: state.email }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
