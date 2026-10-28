import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { format } from "date-fns";
import { enUS, ru, uk } from "date-fns/locale";
import { GlassCard, FadeInUp, RadialGauge } from "@shared/components";
import { colors, spacing, typography } from "@shared/theme";
import { useT, useTranslatedTexts, useLocaleStore } from "@shared/i18n";
import { useUserStore } from "@shared/storage/useUserStore";
import { getPersonalDayNumber, getPersonalDayScores } from "@shared/utils/numerology";
import { PERSONAL_DAY_FOCUS, PERSONAL_DAY_FINANCE, PERSONAL_DAY_RELATIONSHIPS } from "../data/personalDayExplanations";
import { NumerologyInsightList, InsightItem } from "./NumerologyInsightList";

const DFS_LOCALES = { en: enUS, ru, uk } as const;

type PersonalDay = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** The numerology tab's equivalent of `HoroscopeWidget` on My Day — a daily
 *  reading, but fully local/deterministic (today's Personal Day Number
 *  needs no API, unlike a sign's horoscope paragraph), so there's no
 *  loading state, period tabs, or share capture here, just the reading
 *  itself plus the same `RadialGauge` dials used on My Day. */
export function NumerologyDailyWidget() {
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  const profile = useUserStore((s) => s.profile);
  const birthDate = profile?.birthDate ?? "1996-06-15";
  const today = new Date();

  const personalDay = useMemo(() => getPersonalDayNumber(birthDate, today) as PersonalDay, [birthDate]);
  const scores = useMemo(() => getPersonalDayScores(personalDay), [personalDay]);

  const sourceTexts = [
    PERSONAL_DAY_FOCUS[personalDay],
    PERSONAL_DAY_FINANCE[personalDay],
    PERSONAL_DAY_RELATIONSHIPS[personalDay],
  ];
  const { texts: localized } = useTranslatedTexts(sourceTexts);
  const focusText = localized[0] || sourceTexts[0];

  const detailItems: InsightItem[] = [
    { key: "finance", label: t("numerology.daily.financeLabel"), text: localized[1] || sourceTexts[1] },
    { key: "relationships", label: t("numerology.daily.relationshipsLabel"), text: localized[2] || sourceTexts[2] },
  ];

  const dfs = DFS_LOCALES[locale];

  return (
    <FadeInUp>
      <GlassCard glow sparkles>
        <View style={styles.headerRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeNumber}>{personalDay}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>{t("numerology.daily.eyebrow")}</Text>
            <Text style={styles.date}>{format(today, "EEEE, d MMMM", { locale: dfs })}</Text>
          </View>
        </View>

        <Text style={styles.body}>{focusText}</Text>

        <View style={styles.insightWrap}>
          <NumerologyInsightList items={detailItems} />
        </View>

        <View style={styles.gaugeRow}>
          <RadialGauge value={scores.focus} label={t("numerology.daily.focusGauge")} color={colors.accent} delay={0} />
          <RadialGauge value={scores.finance} label={t("numerology.daily.financeGauge")} color={colors.gold} delay={100} />
          <RadialGauge
            value={scores.relationships}
            label={t("numerology.daily.relationshipsGauge")}
            color={colors.rose}
            delay={200}
          />
        </View>
      </GlassCard>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.4,
    borderColor: colors.gold,
    backgroundColor: colors.bg2,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeNumber: { color: colors.gold, fontFamily: typography.h2.fontFamily, fontSize: 18 },
  eyebrow: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
  date: { color: colors.textPrimary, fontFamily: typography.h3.fontFamily, fontSize: 17, marginTop: 2 },
  body: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: 14.5,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  insightWrap: { marginBottom: spacing.lg },
  gaugeRow: { flexDirection: "row", justifyContent: "space-between" },
});
