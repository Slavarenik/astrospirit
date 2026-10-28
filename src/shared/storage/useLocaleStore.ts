import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { asyncStorageAdapter } from "./persist";

export type Locale = "en" | "ru" | "uk";

type LocaleState = {
  locale: Locale;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setLocale: (locale: Locale) => void;
};

/** Persisted UI language — "uk" is Ukrainian (shown as "UA" in the switcher). */
export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en",
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      setLocale: (locale) => {
        console.log(`[i18n] locale → ${locale}`);
        set({ locale });
      },
    }),
    {
      name: "astrospirit/locale",
      storage: createJSONStorage(() => asyncStorageAdapter),
      partialize: (state) => ({ locale: state.locale }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        console.log(`[i18n] locale hydrated: ${state?.locale ?? "en"}`);
      },
    }
  )
);
