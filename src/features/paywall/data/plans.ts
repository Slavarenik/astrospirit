export type PlanId = "week" | "month" | "year";

export type PaywallPlan = {
  id: PlanId;
  /** Localized price string from the store (RevenueCat Package). Null until
   *  offerings load — never hardcode store prices here. */
  price: string | null;
  /** Optional per-unit breakdown, e.g. "$3.33 / mo" for yearly. */
  priceBreakdown: string | null;
  /** % saved vs weekly annualized rate, computed from live store prices. */
  savePercent?: number | null;
  highlight?: "popular" | "value";
};

/** Plan slots shown on the paywall. Prices/savings are filled from the
 *  live RevenueCat offering in `mergeLiveOffering` — these entries only
 *  define identity + marketing highlight. */
export const PAYWALL_PLANS: PaywallPlan[] = [
  { id: "week", price: null, priceBreakdown: null, savePercent: null },
  { id: "month", price: null, priceBreakdown: null, savePercent: null, highlight: "popular" },
  { id: "year", price: null, priceBreakdown: null, savePercent: null, highlight: "value" },
];
