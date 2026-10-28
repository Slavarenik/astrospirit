import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { colors, radius, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { searchCities, CityMatch } from "@shared/utils/citySearch";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  /** Called with the picked city (exact lat/lon, no further geocoding
   *  needed) when the person taps a suggestion, or null the moment they
   *  edit the text away from a previous pick — GeneratingScreen falls back
   *  to best-effort free-text geocoding whenever this is null. */
  onSelectCity: (city: CityMatch | null) => void;
  placeholder: string;
};

const DEBOUNCE_MS = 150;
const BLUR_HIDE_DELAY_MS = 150;

/**
 * Natal-chart Stage 2b: a type-ahead city picker over a bundled, fully
 * offline dataset (GeoNames cities15000, ~34k cities worldwide with
 * population ≥15,000 — see shared/data/cities.json) instead of the free
 * text field this replaces. Picking a suggestion gives exact coordinates
 * immediately, with zero ambiguity and zero runtime geocoding — typing
 * without picking still works exactly like before (free text, resolved
 * best-effort later by geocoding.ts), so this is purely additive.
 */
export function CityAutocompleteInput({ value, onChangeText, onSelectCity, placeholder }: Props) {
  const t = useT();
  const [results, setResults] = useState<CityMatch[]>([]);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (blurRef.current) clearTimeout(blurRef.current);
    };
  }, []);

  const handleChangeText = (text: string) => {
    onChangeText(text);
    onSelectCity(null); // typing invalidates any earlier pick
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setResults(searchCities(text));
    }, DEBOUNCE_MS);
  };

  const handleSelect = (city: CityMatch) => {
    onChangeText(`${city.name}, ${city.countryName}`);
    onSelectCity(city);
    setResults([]);
    setFocused(false);
  };

  const handleFocus = () => {
    if (blurRef.current) clearTimeout(blurRef.current);
    setFocused(true);
    if (value) setResults(searchCities(value));
  };

  const handleBlur = () => {
    // Delayed so a tap on a suggestion below registers before the list
    // disappears (a blur fires on that same tap, just slightly earlier).
    blurRef.current = setTimeout(() => setFocused(false), BLUR_HIDE_DELAY_MS);
  };

  const showDropdown = focused && value.trim().length > 0;

  return (
    <View>
      <TextInput
        value={value}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        style={styles.input}
      />
      {showDropdown && (
        <View style={styles.dropdown}>
          {results.length === 0 ? (
            <Text style={styles.noResults}>{t("onboarding.birthDate.noCityResults")}</Text>
          ) : (
            <ScrollView style={styles.dropdownScroll} keyboardShouldPersistTaps="handled">
              {results.map((city, i) => (
                <Pressable
                  key={`${city.name}-${city.countryCode}-${i}`}
                  onPress={() => handleSelect(city)}
                  style={[styles.row, i === results.length - 1 && styles.rowLast]}
                >
                  <Text style={styles.rowName}>{city.name}</Text>
                  <Text style={styles.rowCountry}>{city.countryName}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    color: colors.textPrimary,
    fontFamily: typography.body.fontFamily,
    fontSize: 16,
    paddingVertical: spacing.xs,
  },
  dropdown: {
    marginTop: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
    backgroundColor: colors.bg1,
    overflow: "hidden",
  },
  dropdownScroll: { maxHeight: 220 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  rowLast: { borderBottomWidth: 0 },
  rowName: {
    color: colors.textPrimary,
    fontFamily: typography.body.fontFamily,
    fontSize: 14.5,
    fontWeight: "600",
  },
  rowCountry: {
    color: colors.textTertiary,
    fontFamily: typography.body.fontFamily,
    fontSize: 12.5,
  },
  noResults: {
    color: colors.textTertiary,
    fontFamily: typography.body.fontFamily,
    fontSize: 12.5,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    textAlign: "center",
  },
});
