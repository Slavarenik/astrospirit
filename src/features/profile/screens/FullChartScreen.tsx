import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { ScreenBackground, OrnateFrame, GlassCard, FadeInUp, GlowButton } from "@shared/components";
import { colors, spacing, typography, radius, ELEMENT_COLOR, ZODIAC_ELEMENT, PLANET_GLYPHS } from "@shared/theme";
import { useT } from "@shared/i18n";
import { useUserStore } from "@shared/storage/useUserStore";
import {
  buildBirthInstant,
  buildPreciseBirthInstant,
  getNatalPlacements,
  resolveAscendant,
} from "@shared/utils/astrology";
import { FullChartWheel } from "../components/FullChartWheel";
import { ProfileStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<ProfileStackParamList, "FullChart">;

export function FullChartScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const profile = useUserStore((s) => s.profile);

  const birthHour = profile?.birthTime ? parseInt(profile.birthTime.split(":")[0], 10) : 12;
  const sunSign = profile?.sunSign ?? "Aries";
  const birthDateIso = profile?.birthDate ?? "1996-06-15";
  const birthTime = profile?.birthTime ?? null;

  // Same timezone-aware instant used for the Ascendant also feeds the
  // planet placements below, when we have it — slightly sharper degrees
  // for the (slower-moving) planets too, not just the Ascendant itself.
  const birthInstant = useMemo(() => {
    if (profile?.birthTimezone) {
      return buildPreciseBirthInstant(birthDateIso, birthTime, profile.birthTimezone).instant;
    }
    return buildBirthInstant(birthDateIso, birthTime);
  }, [birthDateIso, birthTime, profile?.birthTimezone]);

  const placements = useMemo(() => getNatalPlacements(birthInstant), [birthInstant]);
  const {
    sign: ascendant,
    isReal: ascendantIsReal,
    longitude: ascendantLongitude,
  } = resolveAscendant(
    sunSign,
    birthHour,
    birthDateIso,
    birthTime,
    profile?.birthLat ?? null,
    profile?.birthLon ?? null,
    profile?.birthTimezone ?? null
  );
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);

  return (
    <ScreenBackground variant="night">
      <OrnateFrame />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 5l-7 7 7 7" stroke={colors.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>{t("fullChart.title")}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Text style={styles.subtitle}>{t("fullChart.subtitle")}</Text>

        <View style={styles.wheelRow}>
          <FullChartWheel
            placements={placements}
            ascendant={ascendant}
            ascendantIsReal={ascendantIsReal}
            ascendantLongitude={ascendantLongitude}
            size={300}
            onHousePress={setSelectedHouse}
          />
        </View>

        <GlowButton
          title={t("fullChart.viewAspects")}
          variant="outline"
          onPress={() => navigation.navigate("Aspects")}
          style={{ marginBottom: spacing.lg, alignSelf: "center" }}
        />

        <FadeInUp>
          <GlassCard sparkles>
            <View style={styles.rows}>
              {placements.map((p) => {
                const tint = ELEMENT_COLOR[ZODIAC_ELEMENT[p.sign]];
                const label = p.key === "sun" || p.key === "moon" ? t(`passport.${p.key}`) : t(`fullChart.planets.${p.key}`);
                return (
                  <View key={p.key} style={styles.row}>
                    <View style={[styles.badge, { borderColor: tint }]}>
                      <Text style={[styles.badgeGlyph, { color: tint }]}>{PLANET_GLYPHS[p.key]}</Text>
                    </View>
                    <Text style={styles.rowLabel}>{label}</Text>
                    <Text style={styles.rowValue}>
                      {Math.floor(p.degreeInSign)}° {t(`signs.${p.sign}`)}
                    </Text>
                  </View>
                );
              })}

              <View style={styles.divider} />

              <View style={styles.row}>
                <View
                  style={[
                    styles.badge,
                    { borderColor: colors.teal, borderStyle: ascendantIsReal ? "solid" : "dashed" },
                  ]}
                >
                  <Text style={[styles.badgeGlyph, { color: colors.teal, fontSize: 10 }]}>ASC</Text>
                </View>
                <Text style={styles.rowLabel}>{t("passport.rising")}</Text>
                <View style={styles.rowValueWrap}>
                  <Text style={styles.rowValue}>{t(`signs.${ascendant}`)}</Text>
                  {!ascendantIsReal && (
                    <View style={styles.estimatedTag}>
                      <Text style={styles.estimatedTagText}>{t("fullChart.estimatedTag")}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </GlassCard>
        </FadeInUp>

        <Text style={styles.footnote}>{t("fullChart.housesNote")}</Text>
        {!ascendantIsReal && <Text style={styles.footnote}>{t("fullChart.ascendantNote")}</Text>}
      </ScrollView>

      <Modal
        visible={selectedHouse !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedHouse(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedHouse(null)}>
          <Pressable style={styles.modalCardWrap} onPress={() => {}}>
            <GlassCard glow sparkles>
              {selectedHouse !== null && (
                <>
                  <Text style={styles.modalEyebrow}>
                    {t("houses.house").replace("{{n}}", String(selectedHouse))}
                  </Text>
                  <Text style={styles.modalTitle}>{t(`houses.names.${selectedHouse}`)}</Text>
                  <Text style={styles.modalBody}>{t(`houses.descriptions.${selectedHouse}`)}</Text>
                </>
              )}
              <Pressable onPress={() => setSelectedHouse(null)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </GlassCard>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backBtn: { width: 34, height: 34, justifyContent: "center" },
  headerTitle: { color: colors.textPrimary, fontFamily: typography.h3.fontFamily, fontSize: 17, fontWeight: "600" },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  wheelRow: { alignItems: "center", marginBottom: spacing.lg },
  rows: { gap: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: 2 },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg1,
  },
  badgeGlyph: { fontSize: 15, fontWeight: "700" },
  rowLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: typography.body.fontFamily,
    fontSize: 14.5,
    fontWeight: "600",
  },
  rowValueWrap: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  rowValue: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 13.5 },
  divider: { height: 1, backgroundColor: colors.hairline, marginVertical: spacing.xs },
  estimatedTag: {
    backgroundColor: colors.bg3,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  estimatedTagText: {
    color: colors.textTertiary,
    fontFamily: typography.label.fontFamily,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  footnote: {
    color: colors.textTertiary,
    fontFamily: typography.body.fontFamily,
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: "center",
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#00000099",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  modalCardWrap: { width: "100%" },
  modalEyebrow: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontFamily: typography.h3.fontFamily,
    fontSize: 19,
    fontWeight: "700",
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  modalBody: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: 14.5,
    lineHeight: 21,
  },
  modalCloseBtn: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: { color: colors.textSecondary, fontSize: 13, fontWeight: "700" },
});
