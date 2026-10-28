import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { asyncStorageAdapter } from "./persist";
import { UserProfile } from "@shared/types/user";
import { logOnboardingComplete } from "@shared/analytics/analytics";
import { syncProfileToFirestore } from "@shared/firebase/firestoreUsers";

type UserState = {
  profile: UserProfile | null;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setProfile: (p: UserProfile) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  resetProfile: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      setProfile: (p) => set({ profile: p }),
      updateProfile: (patch) => {
        const current = get().profile;
        if (!current) return;
        const updated = { ...current, ...patch };
        set({ profile: updated });
        // Keeps Firestore's Users/{deviceId} doc in step with any later
        // profile edit — best-effort.
        syncProfileToFirestore(updated);
      },
      completeOnboarding: () => {
        const current = get().profile;
        if (!current) return;
        const updated = { ...current, onboardingComplete: true };
        set({ profile: updated });
        logOnboardingComplete();
        syncProfileToFirestore(updated);
      },
      resetProfile: () => set({ profile: null }),
    }),
    {
      name: "astrospirit/user-profile",
      storage: createJSONStorage(() => asyncStorageAdapter),
      partialize: (state) => ({ profile: state.profile }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
