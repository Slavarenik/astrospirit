import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useLocaleStore, Locale } from "@shared/storage/useLocaleStore";
import { colors, radius, spacing, typography } from "@shared/theme";

const OPTIONS: { id: Locale; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "ru", label: "RU" },
  { id: "uk", label: "UA" },
];

/** Compact 3-way EN / RU / UA pill switcher, in the same flat gold
 *  segmented-control style as the horoscope period tabs. Persists via
 *  useLocaleStore so the choice survives app restarts. */
export function LanguageSwitcher() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <View style={styles.row}>
      {OPTIONS.map((opt) => {
        const active = opt.id === locale;
        return (
          <Pressable
            key={opt.id}
            onPress={() => setLocale(opt.id)}
            style={[styles.btn, active && styles.btnActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
    borderRadius: radius.pill,
    padding: 3,
    alignSelf: "flex-start",
  },
  btn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  btnActive: { backgroundColor: colors.gold },
  label: {
    color: colors.textTertiary,
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    letterSpacing: 1,
  },
  labelActive: { color: colors.textOnAccent },
});
