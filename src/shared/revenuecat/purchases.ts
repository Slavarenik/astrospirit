import { Linking, Platform } from "react-native";
import Constants from "expo-constants";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PACKAGE_TYPE,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";
import { PaywallPlan, PAYWALL_PLANS, PlanId } from "@features/paywall/data/plans";
import { usePremiumStore } from "@shared/storage/usePremiumStore";

/**
 * Wires the app to RevenueCat. Until EXPO_PUBLIC_REVENUECAT_*_API_KEY is
 * set, `isRevenueCatConfigured()` is false and purchase/restore must not
 * grant premium locally — Paywall shows an unavailable state instead.
 *
 * Dashboard shape this matches (flexible matching below):
 *   Offering:      "premium" (or the project's current offering)
 *   Packages:      premium_weekly / $rc_weekly, premium_monthly / $rc_monthly,
 *                  premium_yearly / $rc_annual
 *   Entitlements:  premium_weekly, premium_monthly, premium_yearly
 */

type RevenueCatExtra = { iosApiKey?: string; androidApiKey?: string };

/** Prefer Metro-inlined EXPO_PUBLIC_* (updates on reload). Fall back to
 *  Constants.extra for release builds where env may be baked via app.config. */
function readApiKey(): string {
  const fromEnv = (
    Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
      : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
  )?.trim();
  if (fromEnv) return fromEnv;

  const extra = (Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {}) as {
    revenueCat?: RevenueCatExtra;
  };
  const fromExtra = (Platform.OS === "ios" ? extra.revenueCat?.iosApiKey : extra.revenueCat?.androidApiKey)?.trim();
  return fromExtra ?? "";
}

function getApiKey(): string {
  return readApiKey();
}

/** True once EXPO_PUBLIC_REVENUECAT_IOS_API_KEY / _ANDROID_API_KEY has been
 *  filled into .env for the current platform. */
export function isRevenueCatConfigured(): boolean {
  return !!getApiKey();
}

export const OFFERING_ID = "premium";

/** Preferred App Store / Play product identifiers. */
export const PRODUCT_IDS: Record<PlanId, string> = {
  week: "premium_weekly",
  month: "premium_monthly",
  year: "premium_yearly",
};

/** Identifiers we accept for a package (RevenueCat package id OR store product id). */
const PACKAGE_ALIASES: Record<PlanId, string[]> = {
  week: ["premium_weekly", "$rc_weekly", "weekly", "week"],
  month: ["premium_monthly", "$rc_monthly", "monthly", "month"],
  year: ["premium_yearly", "premium_annual", "$rc_annual", "$rc_yearly", "yearly", "annual", "year"],
};

const PACKAGE_TYPE_BY_PLAN: Record<PlanId, PACKAGE_TYPE> = {
  week: PACKAGE_TYPE.WEEKLY,
  month: PACKAGE_TYPE.MONTHLY,
  year: PACKAGE_TYPE.ANNUAL,
};

let configured = false;

/** Configures the RevenueCat SDK once. Safe to call repeatedly; no-op when
 *  no API key is set. Call before any other function below. */
export function configureRevenueCat(): void {
  const apiKey = getApiKey();
  if (configured || !apiKey) return;
  Purchases.configure({ apiKey });
  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  configured = true;
  if (__DEV__) {
    console.log(`[RevenueCat] configured (${Platform.OS}), key=…${apiKey.slice(-6)}`);
  }
}

/** Picks the active plan from CustomerInfo. Prefers the longest commitment
 *  if more than one entitlement is somehow active. */
function bestActivePlan(info: CustomerInfo): PlanId | null {
  const active = info.entitlements.active;
  if (active.premium_yearly || active.premium_annual) return "year";
  if (active.premium_monthly) return "month";
  if (active.premium_weekly) return "week";
  // Single shared "premium" entitlement — still Premium, plan unknown.
  if (active.premium) return "month";
  return null;
}

/** True when any of the three tier entitlements is currently active. */
export function hasActiveEntitlement(info: CustomerInfo): boolean {
  return bestActivePlan(info) !== null || Object.keys(info.entitlements.active).length > 0;
}

/** Mirrors RevenueCat CustomerInfo into usePremiumStore. */
export function syncPremiumFromCustomerInfo(info: CustomerInfo): void {
  const plan = bestActivePlan(info);
  const premium = plan !== null || Object.keys(info.entitlements.active).length > 0;
  usePremiumStore.getState().setPremium(premium, plan);
}

/** Fetches the "premium" offering. Falls back to `current` if nothing is
 *  named "premium". Returns null if not configured or the fetch fails. */
export async function getPremiumOffering(): Promise<PurchasesOffering | null> {
  if (!isRevenueCatConfigured()) {
    if (__DEV__) console.warn("[RevenueCat] no API key — check EXPO_PUBLIC_REVENUECAT_*_API_KEY in .env");
    return null;
  }
  configureRevenueCat();
  try {
    const offerings = await Purchases.getOfferings();
    const offering = offerings.all[OFFERING_ID] ?? offerings.current ?? null;
    if (__DEV__) {
      const ids = Object.keys(offerings.all);
      const pkgs = offering?.availablePackages.map(
        (p) => `${p.identifier}→${p.product.identifier} (${p.packageType})`
      );
      console.log(
        `[RevenueCat] offerings=[${ids.join(", ") || "none"}] current=${offerings.current?.identifier ?? "null"} ` +
          `picked=${offering?.identifier ?? "null"} packages=${JSON.stringify(pkgs ?? [])}`
      );
    }
    return offering;
  } catch (e) {
    if (__DEV__) console.warn("[RevenueCat] getOfferings failed", e);
    return null;
  }
}

function idsMatch(candidate: string, aliases: string[]): boolean {
  const c = candidate.toLowerCase();
  return aliases.some((a) => c === a.toLowerCase() || c.endsWith(`.${a.toLowerCase()}`) || c.includes(a.toLowerCase()));
}

function findPackage(offering: PurchasesOffering, planId: PlanId): PurchasesPackage | null {
  const aliases = PACKAGE_ALIASES[planId];

  const byAlias = offering.availablePackages.find(
    (p) => idsMatch(p.identifier, aliases) || idsMatch(p.product.identifier, aliases)
  );
  if (byAlias) return byAlias;

  const wantType = PACKAGE_TYPE_BY_PLAN[planId];
  return offering.availablePackages.find((p) => p.packageType === wantType) ?? null;
}

function formatPerMonth(price: number, currencyCode: string): string {
  const perMonth = price / 12;
  try {
    return `${new Intl.NumberFormat(undefined, { style: "currency", currency: currencyCode }).format(perMonth)} / mo`;
  } catch {
    return `${perMonth.toFixed(2)} ${currencyCode} / mo`;
  }
}

/** % saved vs the weekly package's annualized price (price × 52). */
function computeSavePercent(weeklyPrice: number, price: number, planId: PlanId): number | null {
  if (planId === "week" || weeklyPrice <= 0) return null;
  const weeklyAnnualized = weeklyPrice * 52;
  const periodAnnualized = planId === "month" ? price * 12 : price;
  const pct = Math.round((1 - periodAnnualized / weeklyAnnualized) * 100);
  return pct > 0 ? pct : null;
}

export type LivePlan = PaywallPlan & { pkg: PurchasesPackage | null };

/** Builds paywall plans from a live offering. Only plans with a real store
 *  package are returned — no mock prices. Pass null to get an empty list. */
export function mergeLiveOffering(offering: PurchasesOffering | null): LivePlan[] {
  if (!offering) return [];

  const weekPkg = findPackage(offering, "week");
  const weeklyPrice = weekPkg?.product.price ?? null;
  const plans: LivePlan[] = [];

  for (const meta of PAYWALL_PLANS) {
    const pkg = findPackage(offering, meta.id);
    if (!pkg) continue;

    const priceBreakdown =
      meta.id === "year" ? formatPerMonth(pkg.product.price, pkg.product.currencyCode) : null;
    const livePercent =
      weeklyPrice != null ? computeSavePercent(weeklyPrice, pkg.product.price, meta.id) : null;

    plans.push({
      ...meta,
      price: pkg.product.priceString,
      priceBreakdown,
      savePercent: livePercent,
      pkg,
    });
  }

  return plans;
}

/** Opens the native App Store / Play subscription management screen. */
export function openNativeSubscriptionManagement(): void {
  const url =
    Platform.OS === "ios"
      ? "itms-apps://apps.apple.com/account/subscriptions"
      : "https://play.google.com/store/account/subscriptions";
  Linking.openURL(url).catch(() => {});
}

/** True when the thrown purchase error means the user dismissed the sheet. */
export function isPurchaseCancelled(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { userCancelled?: boolean; code?: string | number };
  if (e.userCancelled) return true;
  return e.code === "1" || e.code === 1 || e.code === "PURCHASE_CANCELLED";
}
