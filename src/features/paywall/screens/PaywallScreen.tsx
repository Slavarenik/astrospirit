import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";
import Purchases, { PurchasesOffering } from "react-native-purchases";
import { ScreenBackground, FadeInUp, OrnateFrame, GlowButton, GlassCard, CornerSparkle } from "@shared/components";
import { colors, spacing, typography } from "@shared/theme";
import { useT, useTList } from "@shared/i18n";
import { usePremiumStore } from "@shared/storage/usePremiumStore";
import { logPurchase } from "@shared/analytics/analytics";
import {
  getPremiumOffering,
  mergeLiveOffering,
  isRevenueCatConfigured,
  syncPremiumFromCustomerInfo,
  hasActiveEntitlement,
  openNativeSubscriptionManagement,
  isPurchaseCancelled,
} from "@shared/revenuecat/purchases";
import { PremiumPreviewCarousel } from "../components/PremiumPreviewCarousel";
import { PlanCard } from "../components/PlanCard";
import { PlanId } from "../data/plans";

function CloseIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M5 5l14 14M19 5L5 19" stroke={colors.gold} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function CrownIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 18h18l-1.6-8-4.2 3.2L12 6.5 9.8 13.2 5.6 10 4 18z"
        stroke={colors.gold}
        strokeWidth={1.6}
        strokeLinejoin="round"
        fill={colors.goldSoft}
      />
    </Svg>
  );
}

export function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const t = useT();
  const perks = useTList("paywall.perks.items");
  const isPremium = usePremiumStore((s) => s.isPremium);
  const planId = usePremiumStore((s) => s.planId);
  const [selected, setSelected] = useState<PlanId>("month");
  const [restoring, setRestoring] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const o = await getPremiumOffering();
      if (cancelled) return;
      setOffering(o);
      setLoadingPlans(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const plans = useMemo(() => mergeLiveOffering(offering), [offering]);
  const selectedPlan = plans.find((p) => p.id === selected) ?? plans[0] ?? null;

  useEffect(() => {
    if (!plans.length) return;
    if (!plans.some((p) => p.id === selected)) {
      setSelected(plans.find((p) => p.highlight === "popular")?.id ?? plans[0].id);
    }
  }, [plans, selected]);

  const handleContinue = async () => {
    if (!selectedPlan?.pkg) {
      Alert.alert(t("paywall.error.title"), t("paywall.error.unavailable"));
      return;
    }
    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(selectedPlan.pkg);
      syncPremiumFromCustomerInfo(customerInfo);
      logPurchase(selectedPlan.id, selectedPlan.pkg.product.price, selectedPlan.pkg.product.currencyCode);
      navigation.goBack();
    } catch (e) {
      if (!isPurchaseCancelled(e)) {
        Alert.alert(t("paywall.error.title"), t("paywall.error.purchaseFailed"));
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleSwitchPlan = async () => {
    if (!selectedPlan?.pkg) {
      Alert.alert(t("paywall.error.title"), t("paywall.error.unavailable"));
      return;
    }
    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(selectedPlan.pkg);
      syncPremiumFromCustomerInfo(customerInfo);
      logPurchase(selectedPlan.id, selectedPlan.pkg.product.price, selectedPlan.pkg.product.currencyCode);
    } catch (e) {
      if (!isPurchaseCancelled(e)) {
        Alert.alert(t("paywall.error.title"), t("paywall.error.purchaseFailed"));
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (!isRevenueCatConfigured()) {
      Alert.alert(t("paywall.error.title"), t("paywall.error.unavailable"));
      return;
    }
    setRestoring(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      syncPremiumFromCustomerInfo(customerInfo);
      Alert.alert(
        t("paywall.manage.restoreCta"),
        hasActiveEntitlement(customerInfo) ? t("paywall.manage.restoreFound") : t("paywall.manage.restoreNotFound")
      );
    } catch {
      Alert.alert(t("paywall.manage.restoreCta"), t("paywall.manage.restoreNotFound"));
    } finally {
      setRestoring(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(t("paywall.manage.cancelConfirmTitle"), t("paywall.manage.cancelConfirmBody"), [
      { text: t("paywall.manage.cancelConfirmKeep"), style: "cancel" },
      {
        text: t("paywall.manage.cancelConfirmConfirm"),
        style: "destructive",
        onPress: () => {
          if (!isRevenueCatConfigured()) {
            Alert.alert(t("paywall.error.title"), t("paywall.error.unavailable"));
            return;
          }
          openNativeSubscriptionManagement();
        },
      },
    ]);
  };

  const plansReady = !loadingPlans && plans.length > 0;
  const plansUnavailable = !loadingPlans && plans.length === 0;

  return (
    <ScreenBackground variant="night">
      <OrnateFrame />
      <Pressable
        onPress={() => navigation.goBack()}
        style={[styles.closeBtn, { top: insets.top + spacing.sm }]}
        hitSlop={10}
      >
        <CloseIcon />
      </Pressable>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <FadeInUp>
          <PremiumPreviewCarousel />
        </FadeInUp>

        <FadeInUp delay={120} style={styles.headerBlock}>
          <Text style={styles.eyebrow}>{t("paywall.eyebrow")}</Text>
          <Text style={styles.headline}>{isPremium ? t("paywall.manage.title") : t("paywall.headline")}</Text>
          <Text style={styles.subtitle}>{isPremium ? t("paywall.manage.subtitle") : t("paywall.subtitle")}</Text>
        </FadeInUp>

        {isPremium && (
          <FadeInUp delay={160}>
            <GlassCard sparkles glow style={styles.activeCard}>
              <View style={styles.activeRow}>
                <View style={styles.activeIconWrap}>
                  <CrownIcon />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activeLabel}>{t("paywall.manage.currentPlan")}</Text>
                  <Text style={styles.activeValue}>{t(`paywall.plans.${planId ?? "month"}.label`)}</Text>
                </View>
              </View>
            </GlassCard>
          </FadeInUp>
        )}

        <FadeInUp delay={220} style={styles.plans}>
          {isPremium && <Text style={styles.changePlanTitle}>{t("paywall.manage.changePlanTitle")}</Text>}

          {loadingPlans && (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.gold} />
              <Text style={styles.loadingText}>{t("paywall.loadingPlans")}</Text>
            </View>
          )}

          {plansUnavailable && (
            <GlassCard style={styles.unavailableCard}>
              <Text style={styles.unavailableText}>{t("paywall.error.unavailable")}</Text>
            </GlassCard>
          )}

          {plansReady &&
            plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} selected={selected === plan.id} onPress={() => setSelected(plan.id)} />
            ))}

          {isPremium && plansReady && (
            <GlowButton
              title={t("paywall.manage.switchCta")}
              variant="outline"
              onPress={handleSwitchPlan}
              disabled={selected === planId || !selectedPlan?.pkg}
              loading={purchasing}
              style={{ marginTop: spacing.xs }}
            />
          )}
        </FadeInUp>

        <FadeInUp delay={320}>
          <GlassCard sparkles style={styles.perksCard}>
            <Text style={styles.perksTitle}>{t("paywall.perks.title")}</Text>
            {perks.map((perk) => (
              <View key={perk} style={styles.perkRow}>
                <CornerSparkle size={9} color={colors.gold} opacity={0.85} />
                <Text style={styles.perkText}>{perk}</Text>
              </View>
            ))}
          </GlassCard>
        </FadeInUp>

        <FadeInUp delay={400} style={styles.footer}>
          {isPremium ? (
            <>
              <GlowButton
                title={t("paywall.manage.restoreCta")}
                variant="outline"
                onPress={handleRestore}
                loading={restoring}
                style={{ alignSelf: "stretch" }}
              />
              <Pressable onPress={handleCancelSubscription} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>{t("paywall.manage.cancelCta")}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <GlowButton
                title={t("paywall.cta")}
                onPress={handleContinue}
                loading={purchasing}
                disabled={!plansReady || !selectedPlan?.pkg}
              />
              <Pressable onPress={handleRestore} style={styles.skipBtn} disabled={restoring}>
                <Text style={styles.skipText}>{restoring ? t("paywall.manage.restoring") : t("paywall.manage.restoreCta")}</Text>
              </Pressable>
              <Pressable onPress={() => navigation.goBack()} style={styles.skipBtn}>
                <Text style={styles.skipText}>{t("paywall.skip")}</Text>
              </Pressable>
            </>
          )}
          <Text style={styles.terms}>{t("paywall.terms")}</Text>
        </FadeInUp>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg },
  closeBtn: {
    position: "absolute",
    right: spacing.lg,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBlock: { alignItems: "center", marginTop: spacing.xl, marginBottom: spacing.lg },
  eyebrow: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
  headline: {
    color: colors.gold,
    fontFamily: typography.display.fontFamily,
    fontSize: 28,
    marginTop: 4,
    letterSpacing: 0.6,
    textAlign: "center",
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  activeCard: { marginBottom: spacing.lg },
  activeRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  activeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  activeLabel: {
    color: colors.textTertiary,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
  activeValue: { color: colors.gold, fontFamily: typography.h3.fontFamily, fontSize: 16, marginTop: 2 },
  plans: { gap: spacing.sm, marginBottom: spacing.lg },
  changePlanTitle: {
    color: colors.textTertiary,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
    marginBottom: 2,
  },
  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  loadingText: {
    color: colors.textTertiary,
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
  },
  unavailableCard: { paddingVertical: spacing.lg },
  unavailableText: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  perksCard: { marginBottom: spacing.xl },
  perksTitle: { color: colors.gold, fontFamily: typography.h3.fontFamily, fontSize: 16, marginBottom: spacing.sm },
  perkRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs },
  perkText: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 13.5, flex: 1 },
  footer: { alignItems: "center" },
  skipBtn: { marginTop: spacing.md, padding: spacing.xs },
  skipText: { color: colors.textTertiary, fontFamily: typography.body.fontFamily, fontSize: 13.5 },
  cancelBtn: { marginTop: spacing.md, padding: spacing.xs },
  cancelText: { color: colors.rose, fontFamily: typography.body.fontFamily, fontSize: 13.5 },
  terms: {
    color: colors.textTertiary,
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    textAlign: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});
