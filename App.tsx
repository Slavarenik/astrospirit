import React, { useCallback, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { View } from "react-native";
import { RootNavigator } from "@app/navigation/RootNavigator";
import { ScreenBackground, NatalLoader } from "@shared/components";
import { useUserStore } from "@shared/storage/useUserStore";
import { useLocaleStore } from "@shared/storage/useLocaleStore";
import { useNotificationsStore } from "@shared/storage/useNotificationsStore";
import { isGoogleTranslateConfigured } from "@shared/i18n/googleTranslate";
import { requestNotificationPermission } from "@shared/notifications/notifications";
import { useSyncNotifications } from "@shared/notifications/useSyncNotifications";
import { useAuthStore } from "@shared/storage/useAuthStore";
import { useFriendsStore } from "@shared/storage/useFriendsStore";
import { useAuthSync } from "@shared/firebase/useAuthSync";
import { useFriendsSync } from "@shared/firebase/useFriendsSync";
import { useRevenueCatSync } from "@shared/revenuecat/useRevenueCatSync";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const userHydrated = useUserStore((s) => s.hasHydrated);
  const localeHydrated = useLocaleStore((s) => s.hasHydrated);
  const notificationsHydrated = useNotificationsStore((s) => s.hasHydrated);
  const authHydrated = useAuthStore((s) => s.hasHydrated);
  const friendsHydrated = useFriendsStore((s) => s.hasHydrated);
  const hasHydrated = userHydrated && localeHydrated && notificationsHydrated && authHydrated && friendsHydrated;
  const [ready, setReady] = useState(false);

  // Keeps the device's scheduled daily/weekly notifications in sync with
  // useNotificationsStore + the user's sign/locale — runs on every mount
  // and whenever those change, not just when the settings screen is open.
  useSyncNotifications();

  // Mirrors Firebase Auth's own state into useAuthStore, then (once signed
  // in and Firebase is configured) mirrors useFriendsStore to/from
  // Firestore — both no-op gracefully until Firebase is set up in .env.
  useAuthSync();
  useFriendsSync();

  // Configures RevenueCat and keeps usePremiumStore mirrored to the
  // account's real entitlements — no-ops until EXPO_PUBLIC_REVENUECAT_*_API_KEY
  // is set in .env (see .env.example).
  useRevenueCatSync();

  useEffect(() => {
    if (hasHydrated) {
      console.log(
        `[i18n] boot: locale=${useLocaleStore.getState().locale}, translateKey=${isGoogleTranslateConfigured() ? "yes" : "NO"}`
      );
      setReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [hasHydrated]);

  // There's no in-app toggle for notifications anymore — daily/weekly
  // reminders are on by default for everyone (useNotificationsStore), so
  // the OS permission prompt itself is the only thing standing between a
  // fresh install and notifications actually firing. Ask for it once, up
  // front. useSyncNotifications() picks up the result (via `permission` in
  // the store) and schedules as soon as it's granted.
  useEffect(() => {
    requestNotificationPermission()
      .then((status) => useNotificationsStore.getState().setPermission(status))
      .catch(() => {});
  }, []);

  // Don't hang forever if a persist store fails to rehydrate
  useEffect(() => {
    const t = setTimeout(() => {
      if (!useLocaleStore.getState().hasHydrated) useLocaleStore.getState().setHasHydrated(true);
      if (!useUserStore.getState().hasHydrated) useUserStore.getState().setHasHydrated(true);
      if (!useNotificationsStore.getState().hasHydrated) useNotificationsStore.getState().setHasHydrated(true);
      if (!useAuthStore.getState().hasHydrated) useAuthStore.getState().setHasHydrated(true);
      if (!useFriendsStore.getState().hasHydrated) useFriendsStore.getState().setHasHydrated(true);
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (ready) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  if (!ready) {
    return (
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <ScreenBackground variant="night">
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <NatalLoader size={120} />
          </View>
        </ScreenBackground>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
