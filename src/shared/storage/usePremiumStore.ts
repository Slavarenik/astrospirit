import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { asyncStorageAdapter } from "./persist";
import { PlanId } from "@features/paywall/data/plans";

type PremiumState = {
  isPremium: boolean;
  /** Which plan is active (week/month/year) — null when not subscribed.
   *  Mirrored from RevenueCat CustomerInfo by useRevenueCatSync whenever
   *  entitlements change, and set right after a successful purchase/restore
   *  in PaywallScreen so the UI doesn't wait on the next listener tick. */
  planId: PlanId | null;
  setPremium: (v: boolean, planId?: PlanId | null) => void;
};

/** Premium flag + active plan. Source of truth is RevenueCat
 *  (see src/shared/revenuecat/useRevenueCatSync.ts); persisted locally so
 *  entitlement state survives offline launches until the next sync. */
export const usePremiumStore = create<PremiumState>()(
  persist(
    (set) => ({
      isPremium: false,
      planId: null,
      setPremium: (v, planId) => set({ isPremium: v, planId: v ? (planId ?? null) : null }),
    }),
    { name: "astrospirit/premium", storage: createJSONStorage(() => asyncStorageAdapter) }
  )
);
