import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { asyncStorageAdapter } from "./persist";

export type NotificationPermissionState = "granted" | "denied" | "undetermined" | "unknown";

type NotificationsState = {
  dailyEnabled: boolean;
  dailyHour: number; // 0-23
  dailyMinute: number; // 0-59
  weeklyEnabled: boolean;
  weeklyWeekday: number; // 1=Sunday .. 7=Saturday (Expo/iOS calendar-trigger convention)
  weeklyHour: number;
  weeklyMinute: number;
  permission: NotificationPermissionState;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setDaily: (patch: Partial<Pick<NotificationsState, "dailyEnabled" | "dailyHour" | "dailyMinute">>) => void;
  setWeekly: (
    patch: Partial<Pick<NotificationsState, "weeklyEnabled" | "weeklyWeekday" | "weeklyHour" | "weeklyMinute">>
  ) => void;
  setPermission: (p: NotificationPermissionState) => void;
};

/** Defaults: a 9am daily nudge, and a Monday 9:30am week-ahead summary —
 *  both local, on-device scheduled notifications (no push server needed). */
export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      dailyEnabled: true,
      dailyHour: 9,
      dailyMinute: 0,
      weeklyEnabled: true,
      weeklyWeekday: 2, // Monday
      weeklyHour: 9,
      weeklyMinute: 30,
      permission: "unknown",
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      setDaily: (patch) => set(patch),
      setWeekly: (patch) => set(patch),
      setPermission: (p) => set({ permission: p }),
    }),
    {
      name: "astrospirit/notifications",
      storage: createJSONStorage(() => asyncStorageAdapter),
      partialize: (state) => ({
        dailyEnabled: state.dailyEnabled,
        dailyHour: state.dailyHour,
        dailyMinute: state.dailyMinute,
        weeklyEnabled: state.weeklyEnabled,
        weeklyWeekday: state.weeklyWeekday,
        weeklyHour: state.weeklyHour,
        weeklyMinute: state.weeklyMinute,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
