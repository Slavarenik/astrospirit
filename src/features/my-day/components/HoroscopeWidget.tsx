import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { format } from "date-fns";
import { enUS, ru, uk } from "date-fns/locale";
import { GlassCard, RadialGauge, FadeInUp, ZodiacIcon, NatalLoader, ShareButton } from "@shared/components";
import { colors, radius, spacing, typography } from "@shared/theme";
import { useT, useTranslatedTexts, useLocaleStore, Locale } from "@shared/i18n";
import { logShareBlock } from "@shared/analytics/analytics";
import { useHoroscope, HoroscopePeriod } from "../hooks/useDailyHoroscope";

const PERIODS: { id: HoroscopePeriod; labelKey: string; eyebrowKey: string }[] = [
  { id: "daily", labelKey: "horoscope.day", eyebrowKey: "horoscope.today" },
  { id: "weekly", labelKey: "horoscope.week", eyebrowKey: "horoscope.thisWeek" },
  { id: "monthly", labelKey: "horoscope.month", eyebrowKey: "horoscope.thisMonth" },
];

const DFS_LOCALES = { en: enUS, ru, uk } as const;

function periodDateLabel(period: HoroscopePeriod, locale: Locale): string {
  const now = new Date();
  const dfs = DFS_LOCALES[locale];
  if (period === "weekly") return format(now, "MMMM d", { locale: dfs });
  if (period === "monthly") return format(now, "LLLL yyyy", { locale: dfs });
  return format(now, "EEEE, d MMMM", { locale: dfs });
}

function PeriodTabs({
  value,
  onChange,
  t,
}: {
  value: HoroscopePeriod;
  onChange: (p: HoroscopePeriod) => void;
  t: (path: string) => string;
}) {
  return (
    <View style={styles.tabsRow}>
      {PERIODS.map((p) => {
        const active = p.id === value;
        return (
          <Pressable
            key={p.id}
            onPress={() => onChange(p.id)}
            style={[styles.tabBtn, active && styles.tabBtnActive]}
          >
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
              {t(p.labelKey).toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function HoroscopeWidget() {
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  const [period, setPeriod] = useState<HoroscopePeriod>("daily");
  const { loading, horoscopeText, indexes, tips, sign } = useHoroscope(period);
  const eyebrowKey = PERIODS.find((p) => p.id === period)?.eyebrowKey ?? "horoscope.today";
  const { texts: localizedDoTips } = useTranslatedTexts(tips.doTips);
  const { texts: localizedDontTips } = useTranslatedTexts(tips.dontTips);

  const shotRef = useRef<ViewShot>(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      const uri: string | undefined = await shotRef.current?.capture?.();
      if (!uri) throw new Error("capture failed");
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri);
        logShareBlock("horoscope");
      }
    } catch {
      Alert.alert("Couldn't share", "Something went wrong sharing the image.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <FadeInUp>
      <ViewShot ref={shotRef} options={{ format: "png", quality: 1 }}>
        <GlassCard glow sparkles>
          <View style={styles.headerRow}>
            <ZodiacIcon sign={sign} size={44} variant="ring" />
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>
                {t(eyebrowKey)} · {t(`signs.${sign}`).toUpperCase()}
              </Text>
              <Text style={styles.date}>{periodDateLabel(period, locale)}</Text>
            </View>
            {!loading && <ShareButton onPress={handleShare} busy={sharing} />}
          </View>

          <PeriodTabs value={period} onChange={setPeriod} t={t} />

          {loading ? (
            <View style={styles.loaderWrap}>
              <NatalLoader size={88} label={t("horoscope.readingSky")} />
            </View>
          ) : (
            <>
              <Text style={styles.body}>{horoscopeText}</Text>

              <View style={styles.tipsBlock}>
                <View style={styles.tipsCol}>
                  <Text style={styles.tipsHeading}>{t("horoscope.whatToDo")}</Text>
                  {(localizedDoTips.length ? localizedDoTips : tips.doTips).map((tip, i) => (
                    <View key={i} style={styles.tipRow}>
                      <View style={[styles.tipMark, { borderColor: colors.success }]}>
                        <Text style={[styles.tipMarkText, { color: colors.success }]}>✓</Text>
                      </View>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.tipsCol}>
                  <Text style={styles.tipsHeading}>{t("horoscope.whatNotToDo")}</Text>
                  {(localizedDontTips.length ? localizedDontTips : tips.dontTips).map((tip, i) => (
                    <View key={i} style={styles.tipRow}>
                      <View style={[styles.tipMark, { borderColor: colors.danger }]}>
                        <Text style={[styles.tipMarkText, { color: colors.danger }]}>✕</Text>
                      </View>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.gaugeRow}>
                <RadialGauge value={indexes.energy} label={t("horoscope.energy")} color={colors.accent} delay={0} />
                <RadialGauge value={indexes.intuition} label={t("horoscope.intuition")} color={colors.violet} delay={100} />
                <RadialGauge value={indexes.tension} label={t("horoscope.tension")} color={colors.rose} delay={200} />
                <RadialGauge value={indexes.luck} label={t("horoscope.luck")} color={colors.teal} delay={300} />
              </View>
            </>
          )}
        </GlassCard>
      </ViewShot>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  eyebrow: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
  date: {
    color: colors.textPrimary,
    fontFamily: typography.h3.fontFamily,
    fontSize: 17,
    marginTop: 2,
  },
  tabsRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
    borderRadius: radius.pill,
    padding: 3,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  tabBtnActive: { backgroundColor: colors.gold },
  tabLabel: {
    color: colors.textTertiary,
    fontFamily: typography.label.fontFamily,
    fontSize: 10.5,
    letterSpacing: 1,
  },
  tabLabelActive: { color: colors.textOnAccent },
  body: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: 14.5,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  tipsBlock: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  tipsCol: { flex: 1, gap: 6 },
  tipsHeading: {
    color: colors.textTertiary,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
    marginBottom: 2,
  },
  tipRow: { flexDirection: "row", gap: 7, alignItems: "flex-start" },
  tipMark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.3,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  tipMarkText: { fontSize: 9, fontWeight: "700" },
  tipText: {
    flex: 1,
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: 12.5,
    lineHeight: 17,
  },
  loaderWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    minHeight: 168,
  },
  gaugeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
