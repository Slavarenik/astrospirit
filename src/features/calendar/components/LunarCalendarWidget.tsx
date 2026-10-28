import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { format, addDays, startOfWeek } from "date-fns";
import { enUS, ru, uk } from "date-fns/locale";
import { GlassCard, FadeInUp, MoonPhaseSVG } from "@shared/components";
import { colors, radius, spacing, typography } from "@shared/theme";
import { useT, useLocaleStore, useTranslatedTexts } from "@shared/i18n";
import { getMoonPhase, MOON_PHASE_GUIDANCE } from "@shared/utils/astrology";

const DFS_LOCALES = { en: enUS, ru, uk } as const;

export function LunarCalendarWidget() {
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  const today = new Date();
  const { phase, illumination, age } = getMoonPhase(today);
  const waxing = age < 14.77;
  const pct = Math.round(illumination * 100);
  const { texts } = useTranslatedTexts([phase, MOON_PHASE_GUIDANCE[phase]]);

  const week = useMemo(() => {
    const start = startOfWeek(today, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, []);

  return (
    <FadeInUp>
      <GlassCard glow sparkles>
        <View style={styles.topRow}>
          <MoonPhaseSVG illumination={illumination} waxing={waxing} size={72} />
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>{t("lunar.eyebrow")}</Text>
            <Text style={styles.phaseName}>{texts[0] ?? phase}</Text>
            <Text style={styles.illum}>{t("lunar.illuminated").replace("{{n}}", String(pct))}</Text>
          </View>
        </View>

        <Text style={styles.guidance}>{texts[1] ?? MOON_PHASE_GUIDANCE[phase]}</Text>

        <View style={styles.weekRow}>
          {week.map((d) => {
            const isToday = format(d, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
            return (
              <View key={d.toISOString()} style={[styles.dayPill, isToday && styles.dayPillActive]}>
                <Text style={[styles.dayLabel, isToday && styles.dayLabelActive]}>
                  {format(d, "EEEEE", { locale: DFS_LOCALES[locale] })}
                </Text>
                <Text style={[styles.dayNum, isToday && styles.dayLabelActive]}>{format(d, "d")}</Text>
              </View>
            );
          })}
        </View>
      </GlassCard>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  eyebrow: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
  phaseName: { color: colors.textPrimary, fontFamily: typography.h2.fontFamily, fontSize: 20, marginTop: 2 },
  illum: { color: colors.textTertiary, fontFamily: typography.caption.fontFamily, fontSize: 12, marginTop: 2 },
  guidance: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.md,
  },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  dayPill: {
    width: 36,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.bg3,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  dayPillActive: { backgroundColor: colors.accent },
  dayLabel: { color: colors.textTertiary, fontSize: 10, fontFamily: typography.micro.fontFamily },
  dayNum: { color: colors.textPrimary, fontSize: 14, fontFamily: typography.body.fontFamily, fontWeight: "600" },
  dayLabelActive: { color: colors.textOnAccent },
});
