import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { ScreenBackground, FadeInUp, GlassCard, OrnateFrame, HeaderFlourish, GlowButton } from "@shared/components";
import { colors, spacing, typography } from "@shared/theme";
import { useT, useTranslatedTexts } from "@shared/i18n";
import { useUserStore } from "@shared/storage/useUserStore";
import { usePremiumStore } from "@shared/storage/usePremiumStore";
import { usePaywallNavigation } from "@shared/hooks/usePaywallNavigation";
import {
  getConsciousnessNumber,
  getMissionNumber,
  getPersonalYearNumber,
  getDestinyNumber,
  getSoulUrgeNumber,
  getPersonalityNumber,
  computePythagoreanSquare,
  pythagoreanTraitLevel,
  PYTHAGOREAN_TRAIT_KEYS,
  getHiddenTalentDigits,
  getKarmicLessonNumbers,
  getPinnacleCycles,
  NumerologyValue,
} from "@shared/utils/numerology";
import {
  CONSCIOUSNESS_EXPLANATION,
  MISSION_EXPLANATION,
  PERSONAL_YEAR_EXPLANATION,
} from "../data/numerologyExplanations";
import { DESTINY_EXPLANATION, SOUL_URGE_EXPLANATION, PERSONALITY_EXPLANATION } from "../data/nameNumerologyExplanations";
import { PYTHAGOREAN_TRAIT_EXPLANATION } from "../data/pythagoreanSquareExplanations";
import { HIDDEN_TALENT_EXPLANATION, HIDDEN_TALENT_BALANCED_NOTE } from "../data/hiddenTalentExplanations";
import { KARMIC_LESSON_EXPLANATION, KARMIC_LESSON_NONE_NOTE } from "../data/karmicLessonExplanations";
import { CAREER_EXPLANATION, FINANCIAL_EXPLANATION } from "../data/careerFinanceExplanations";
import { PINNACLE_EXPLANATION } from "../data/pinnacleExplanations";
import { NumerologyGroupCard, NumerologyRow } from "../components/NumerologyGroupCard";
import { PythagoreanSquareGrid, TraitRow } from "../components/PythagoreanSquareGrid";
import { NumerologyInsightList, InsightItem } from "../components/NumerologyInsightList";
import { NumerologyMatchPreviewCard } from "../components/NumerologyMatchPreviewCard";
import { NumerologyDailyWidget } from "../components/NumerologyDailyWidget";

function LockIconDim() {
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
      <Path d="M6 11V8a6 6 0 1112 0v3" stroke={colors.textTertiary} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M5 11h14v9H5z" stroke={colors.textTertiary} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

// Matches the outline GlowButton's own label color, since this only ever
// sits inside that variant here (same convention as AstroPassportCard).
function LockIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
      <Path d="M6 11V8a6 6 0 1112 0v3" stroke={colors.gold} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M5 11h14v9H5z" stroke={colors.gold} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

/** Small "PREMIUM" chip shown next to a section title when its reading is
 *  gated — keeps the section discoverable (title + eyebrow still show)
 *  while flagging that the content itself needs an upgrade. */
function PremiumBadge({ label }: { label: string }) {
  return (
    <View style={styles.premiumBadge}>
      <LockIconDim />
      <Text style={styles.premiumBadgeText}>{label}</Text>
    </View>
  );
}

/** Replaces an insight list with a single unlock button — used for the four
 *  premium numerology readings below. Rendered as an active, visible
 *  GlowButton (same "outline" treatment as View Full Chart) rather than a
 *  muted row, so it reads as a real CTA, not disabled text. Tapping goes
 *  straight to the paywall (no confirmation modal in between). */
function LockedSection({ label, onUnlock }: { label: string; onUnlock: () => void }) {
  return <GlowButton title={label} variant="outline" icon={<LockIcon />} onPress={onUnlock} style={{ alignSelf: "stretch" }} />;
}

export function NumerologyHomeScreen() {
  const insets = useSafeAreaInsets();
  const t = useT();
  const profile = useUserStore((s) => s.profile);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const goToPaywall = usePaywallNavigation();
  const birthDate = profile?.birthDate ?? "1996-06-15";
  const name = profile?.name ?? "";

  const consciousness = useMemo(() => getConsciousnessNumber(birthDate) as NumerologyValue, [birthDate]);
  const mission = useMemo(() => getMissionNumber(birthDate) as NumerologyValue, [birthDate]);
  const personalYear = useMemo(() => getPersonalYearNumber(birthDate), [birthDate]);

  const destiny = useMemo(() => getDestinyNumber(name) as NumerologyValue | null, [name]);
  const soulUrge = useMemo(() => getSoulUrgeNumber(name) as NumerologyValue | null, [name]);
  const personality = useMemo(() => getPersonalityNumber(name) as NumerologyValue | null, [name]);
  const hasNameNumbers = destiny !== null;

  const square = useMemo(() => computePythagoreanSquare(birthDate), [birthDate]);
  const traitLevels = useMemo(
    () => PYTHAGOREAN_TRAIT_KEYS.map((key) => pythagoreanTraitLevel(square.traits[key])),
    [square]
  );

  const talentDigits = useMemo(() => getHiddenTalentDigits(birthDate), [birthDate]);
  const topTalent = talentDigits[0] as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | undefined;

  const karmicMissing = useMemo(
    () => (hasNameNumbers ? getKarmicLessonNumbers(name) ?? [] : []),
    [hasNameNumbers, name]
  );

  const pinnacles = useMemo(() => getPinnacleCycles(birthDate), [birthDate]);

  // Build the translation batch with dynamic offsets rather than hardcoded
  // indices, since the karmic-lesson section's length varies per person.
  const sourceTexts: string[] = [];
  const iConsciousness = sourceTexts.push(CONSCIOUSNESS_EXPLANATION[consciousness]) - 1;
  const iMission = sourceTexts.push(MISSION_EXPLANATION[mission]) - 1;
  const iPersonalYear = sourceTexts.push(PERSONAL_YEAR_EXPLANATION[personalYear as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9]) - 1;
  const iDestiny = sourceTexts.push(destiny !== null ? DESTINY_EXPLANATION[destiny] : "") - 1;
  const iSoulUrge = sourceTexts.push(soulUrge !== null ? SOUL_URGE_EXPLANATION[soulUrge] : "") - 1;
  const iPersonality = sourceTexts.push(personality !== null ? PERSONALITY_EXPLANATION[personality] : "") - 1;

  const iTraitsStart = sourceTexts.length;
  sourceTexts.push(...PYTHAGOREAN_TRAIT_KEYS.map((key, i) => PYTHAGOREAN_TRAIT_EXPLANATION[key][traitLevels[i]]));

  const iTalent = sourceTexts.push(topTalent !== undefined ? HIDDEN_TALENT_EXPLANATION[topTalent] : HIDDEN_TALENT_BALANCED_NOTE) - 1;

  const iKarmicStart = sourceTexts.length;
  const karmicTexts =
    karmicMissing.length > 0
      ? karmicMissing.map((d) => KARMIC_LESSON_EXPLANATION[d as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9])
      : [KARMIC_LESSON_NONE_NOTE];
  sourceTexts.push(...karmicTexts);

  const iCareer = sourceTexts.push(destiny !== null ? CAREER_EXPLANATION[destiny] : "") - 1;
  const iFinance = sourceTexts.push(destiny !== null ? FINANCIAL_EXPLANATION[destiny] : "") - 1;

  const iPinnaclesStart = sourceTexts.length;
  sourceTexts.push(...pinnacles.map((p) => PINNACLE_EXPLANATION[p.number as NumerologyValue]));

  const { texts: localized } = useTranslatedTexts(sourceTexts);
  const text = (i: number) => localized[i] ?? sourceTexts[i];

  const dateRows: NumerologyRow[] = [
    { key: "consciousness", label: t("numerology.consciousness.title"), number: consciousness, color: colors.accent, description: text(iConsciousness) },
    { key: "mission", label: t("numerology.mission.title"), number: mission, color: colors.violet, description: text(iMission) },
    { key: "personalYear", label: t("numerology.personalYear.title"), number: personalYear, color: colors.teal, description: text(iPersonalYear) },
  ];

  const nameRows: NumerologyRow[] = hasNameNumbers
    ? [
        destiny !== null ? { key: "destiny", label: t("numerology.destiny.title"), number: destiny, color: colors.accent, description: text(iDestiny) } : null,
        soulUrge !== null ? { key: "soulUrge", label: t("numerology.soulUrge.title"), number: soulUrge, color: colors.rose, description: text(iSoulUrge) } : null,
        personality !== null ? { key: "personality", label: t("numerology.personality.title"), number: personality, color: colors.teal, description: text(iPersonality) } : null,
      ].filter((r): r is NumerologyRow => r !== null)
    : [];

  const traitRows: TraitRow[] = PYTHAGOREAN_TRAIT_KEYS.map((key, i) => ({
    key,
    title: t(`numerology.square.traits.${key}`),
    levelLabel: t(`numerology.square.level.${traitLevels[i]}`),
    description: text(iTraitsStart + i),
  }));

  const talentItems: InsightItem[] =
    talentDigits.length > 0
      ? talentDigits.map((d, i) => ({ key: `talent-${d}`, label: String(d), text: i === 0 ? text(iTalent) : HIDDEN_TALENT_EXPLANATION[d as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9] }))
      : [{ key: "talent-none", label: t("numerology.talents.title"), text: text(iTalent) }];

  const karmicItems: InsightItem[] =
    karmicMissing.length > 0
      ? karmicMissing.map((d, i) => ({ key: `karmic-${d}`, label: String(d), text: text(iKarmicStart + i) }))
      : [{ key: "karmic-none", label: t("numerology.karmicLessons.title"), text: text(iKarmicStart) }];

  const careerFinanceItems: InsightItem[] = [
    { key: "career", label: t("numerology.career.careerLabel"), text: text(iCareer) },
    { key: "finance", label: t("numerology.career.financeLabel"), text: text(iFinance) },
  ];

  const pinnacleItems: InsightItem[] = pinnacles.map((p, i) => ({
    key: `pinnacle-${i}`,
    label: p.endAge !== null ? t("numerology.pinnacles.ageRange").replace("{{start}}", String(p.startAge)).replace("{{end}}", String(p.endAge)) : t("numerology.pinnacles.ageRangeOpen").replace("{{start}}", String(p.startAge)),
    text: text(iPinnaclesStart + i),
  }));

  return (
    <ScreenBackground>
      <OrnateFrame />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <FadeInUp>
          <Text style={styles.eyebrow}>{t("numerology.eyebrow")}</Text>
          <Text style={styles.headline}>{t("numerology.headline")}</Text>
          <HeaderFlourish />
          <Text style={styles.intro}>{t("numerology.intro")}</Text>
        </FadeInUp>

        <View style={styles.stack}>
          <NumerologyDailyWidget />

          <NumerologyGroupCard
            eyebrow={t("numerology.dateGroup.eyebrow")}
            title={t("numerology.dateGroup.title")}
            rows={dateRows}
            masterLabel={t("numerology.masterNumber")}
            delay={100}
          />

          {hasNameNumbers ? (
            <NumerologyGroupCard
              eyebrow={t("numerology.nameGroup.eyebrow")}
              title={t("numerology.nameGroup.title")}
              rows={nameRows}
              masterLabel={t("numerology.masterNumber")}
              delay={160}
            />
          ) : (
            <FadeInUp delay={160}>
              <GlassCard style={styles.hintCard}>
                <Text style={styles.eyebrow}>{t("numerology.nameGroup.eyebrow")}</Text>
                <Text style={styles.hintText}>{t("numerology.nameGroup.needsLatinName")}</Text>
              </GlassCard>
            </FadeInUp>
          )}

          <FadeInUp delay={200}>
            <GlassCard style={styles.sectionCard}>
              <View style={styles.sectionHeadRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eyebrow}>{t("numerology.talents.eyebrow")}</Text>
                  <Text style={styles.title}>{t("numerology.talents.title")}</Text>
                </View>
                {!isPremium && <PremiumBadge label={t("numerology.premiumBadge")} />}
              </View>
              <View style={styles.listWrap}>
                {isPremium ? (
                  <NumerologyInsightList items={talentItems} />
                ) : (
                  <LockedSection label={t("numerology.unlockPremium")} onUnlock={goToPaywall} />
                )}
              </View>
            </GlassCard>
          </FadeInUp>

          <FadeInUp delay={240}>
            <GlassCard glow sparkles style={styles.sectionCard}>
              <View style={styles.sectionHeadRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eyebrow}>{t("numerology.square.eyebrow")}</Text>
                  <Text style={styles.title}>{t("numerology.square.title")}</Text>
                </View>
                {!isPremium && <PremiumBadge label={t("numerology.premiumBadge")} />}
              </View>
              <Text style={styles.sectionIntro}>{t("numerology.square.intro")}</Text>
              <View style={styles.squareWrap}>
                <PythagoreanSquareGrid
                  counts={square.counts}
                  traits={traitRows}
                  locked={!isPremium}
                  lockedLabel={t("numerology.unlockPremium")}
                  onUnlock={goToPaywall}
                />
              </View>
            </GlassCard>
          </FadeInUp>

          {hasNameNumbers ? (
            <FadeInUp delay={280}>
              <GlassCard style={styles.sectionCard}>
                <View style={styles.sectionHeadRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eyebrow}>{t("numerology.karmicLessons.eyebrow")}</Text>
                    <Text style={styles.title}>{t("numerology.karmicLessons.title")}</Text>
                  </View>
                  {!isPremium && <PremiumBadge label={t("numerology.premiumBadge")} />}
                </View>
                <View style={styles.listWrap}>
                  {isPremium ? (
                    <NumerologyInsightList items={karmicItems} />
                  ) : (
                    <LockedSection label={t("numerology.unlockPremium")} onUnlock={goToPaywall} />
                  )}
                </View>
              </GlassCard>
            </FadeInUp>
          ) : null}

          {hasNameNumbers ? (
            <FadeInUp delay={320}>
              <GlassCard style={styles.sectionCard}>
                <View style={styles.sectionHeadRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eyebrow}>{t("numerology.career.eyebrow")}</Text>
                    <Text style={styles.title}>{t("numerology.career.title")}</Text>
                  </View>
                  {!isPremium && <PremiumBadge label={t("numerology.premiumBadge")} />}
                </View>
                <View style={styles.listWrap}>
                  {isPremium ? (
                    <NumerologyInsightList items={careerFinanceItems} />
                  ) : (
                    <LockedSection label={t("numerology.unlockPremium")} onUnlock={goToPaywall} />
                  )}
                </View>
              </GlassCard>
            </FadeInUp>
          ) : null}

          <FadeInUp delay={360}>
            <GlassCard style={styles.sectionCard}>
              <View style={styles.sectionHeadRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eyebrow}>{t("numerology.pinnacles.eyebrow")}</Text>
                  <Text style={styles.title}>{t("numerology.pinnacles.title")}</Text>
                </View>
                {!isPremium && <PremiumBadge label={t("numerology.premiumBadge")} />}
              </View>
              <View style={styles.listWrap}>
                {isPremium ? (
                  <NumerologyInsightList items={pinnacleItems} />
                ) : (
                  <LockedSection label={t("numerology.unlockPremium")} onUnlock={goToPaywall} />
                )}
              </View>
            </GlassCard>
          </FadeInUp>

          <NumerologyMatchPreviewCard />
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg },
  eyebrow: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
  headline: {
    color: colors.gold,
    fontFamily: typography.display.fontFamily,
    fontSize: 30,
    marginTop: 4,
    letterSpacing: 0.8,
  },
  intro: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  stack: { gap: spacing.md, marginTop: spacing.lg },
  hintCard: { paddingVertical: spacing.lg },
  hintText: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  sectionCard: { marginBottom: spacing.md },
  title: { color: colors.textPrimary, fontFamily: typography.h1.fontFamily, fontSize: 20, marginTop: 2 },
  sectionIntro: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  squareWrap: { alignItems: "center", marginTop: spacing.lg },
  listWrap: { marginTop: spacing.md },
  sectionHeadRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
    backgroundColor: colors.bg2,
    marginTop: 2,
  },
  premiumBadgeText: {
    color: colors.textTertiary,
    fontFamily: typography.label.fontFamily,
    fontSize: 9.5,
    letterSpacing: typography.label.letterSpacing,
  },
});
