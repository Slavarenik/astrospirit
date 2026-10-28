import { useEffect } from "react";
import { AppState } from "react-native";
import Purchases, { CustomerInfo } from "react-native-purchases";
import { configureRevenueCat, isRevenueCatConfigured, syncPremiumFromCustomerInfo } from "./purchases";

/** Configures RevenueCat once, keeps usePremiumStore mirrored to the
 *  account's real entitlements, and re-checks whenever the app comes back
 *  to the foreground — so cancelling in the App Store / Play Store
 *  settings (which this app can only send the user to, see
 *  PaywallScreen's handleCancelSubscription / openNativeSubscriptionManagement)
 *  is picked up as soon as they return. Call this once, high up (App.tsx),
 *  same as useAuthSync()/useFriendsSync(). No-ops entirely until an
 *  EXPO_PUBLIC_REVENUECAT_*_API_KEY is filled into .env. */
export function useRevenueCatSync() {
  useEffect(() => {
    if (!isRevenueCatConfigured()) return;
    configureRevenueCat();

    const onUpdate = (info: CustomerInfo) => syncPremiumFromCustomerInfo(info);
    Purchases.addCustomerInfoUpdateListener(onUpdate);
    Purchases.getCustomerInfo().then(onUpdate).catch(() => {});

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        Purchases.getCustomerInfo().then(onUpdate).catch(() => {});
      }
    });

    return () => {
      Purchases.removeCustomerInfoUpdateListener(onUpdate);
      subscription.remove();
    };
  }, []);
}
