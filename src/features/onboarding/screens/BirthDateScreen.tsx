import React, { useState } from "react";
import { View, Text, StyleSheet, Platform, Pressable, ScrollView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { format } from "date-fns";
import Svg, { Path } from "react-native-svg";
import { OnboardingLayout } from "../components/OnboardingLayout";
import { GlowButton, GlassCard, NatalWheelSVG } from "@shared/components";
import { CityAutocompleteInput } from "../components/CityAutocompleteInput";
import { useOnboardingDraft } from "../onboardingDraftStore";
import { colors, radius, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { OnboardingStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<OnboardingStackParamList, "BirthDate">;

const DEFAULT_DATE = new Date(1996, 5, 15);

function Chevron() {
  return (
    <Svg width={9} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M9 5l7 7-7 7" stroke={colors.gold} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** iOS's "spinner" display has no built-in close affordance — this is the
 *  explicit way to collapse it back down. Android's "default" display is a
 *  native modal dialog that closes itself (see onChange below), so this
 *  only renders on iOS. */
function DoneButton({ onPress, label }: { onPress: () => void; label: string }) {
  if (Platform.OS !== "ios") return null;
  return (
    <Pressable onPress={onPress} style={styles.doneBtn} hitSlop={8}>
      <Text style={styles.doneBtnText}>{label}</Text>
    </Pressable>
  );
}

function PickerRow({
  label,
  value,
  onPress,
  children,
}: {
  label: string;
  value: string;
  onPress?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <GlassCard style={styles.card}>
      <Pressable style={styles.rowBetween} onPress={onPress} disabled={!onPress}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        <View style={styles.rowValue}>
          <Text style={styles.value}>{value}</Text>
          {onPress ? <Chevron /> : null}
        </View>
      </Pressable>
      {children}
    </GlassCard>
  );
}

export function BirthDateScreen({ navigation }: Props) {
  const { birthDate, setBirthDate, birthTime, setBirthTime, birthCity, setBirthCity, setBirthCityCoords } =
    useOnboardingDraft();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const date = birthDate ?? DEFAULT_DATE;
  const t = useT();

  return (
    <OnboardingLayout
      step={2}
      totalSteps={4}
      title={t("onboarding.birthDate.title")}
      subtitle={t("onboarding.birthDate.subtitle")}
      onBack={() => navigation.goBack()}
      footer={
        <GlowButton
          title={t("onboarding.birthDate.generate")}
          onPress={() => {
            if (!birthDate) setBirthDate(DEFAULT_DATE);
            navigation.navigate("RelationshipStatus");
          }}
        />
      }
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wheelWrap}>
          <NatalWheelSVG size={118} showGlyphs showTicks={false} showInnerChart={false} opacity={0.85} />
        </View>

        <View>
          <PickerRow
            label={t("onboarding.birthDate.dateLabel")}
            value={format(date, "MMM d, yyyy")}
            onPress={() => setShowDatePicker((s) => !s)}
          >
            {showDatePicker && (
              <>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  maximumDate={new Date()}
                  onChange={(_, selected) => {
                    if (Platform.OS === "android") setShowDatePicker(false);
                    if (selected) setBirthDate(selected);
                  }}
                  themeVariant="dark"
                  textColor={colors.textPrimary}
                  style={styles.picker}
                />
                <DoneButton onPress={() => setShowDatePicker(false)} label={t("common.done")} />
              </>
            )}
          </PickerRow>

          <PickerRow
            label={t("onboarding.birthDate.timeLabel")}
            value={birthTime ? format(birthTime, "h:mm a") : t("common.optional")}
            onPress={() => setShowTimePicker((s) => !s)}
          >
            {showTimePicker && (
              <>
                <DateTimePicker
                  value={birthTime ?? new Date(1996, 5, 15, 12, 0)}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(_, selected) => {
                    if (Platform.OS === "android") setShowTimePicker(false);
                    if (selected) setBirthTime(selected);
                  }}
                  themeVariant="dark"
                  textColor={colors.textPrimary}
                  style={styles.picker}
                />
                <DoneButton onPress={() => setShowTimePicker(false)} label={t("common.done")} />
              </>
            )}
          </PickerRow>

          <GlassCard style={styles.card}>
            <Text style={styles.label}>{t("onboarding.birthDate.placeLabel").toUpperCase()}</Text>
            <CityAutocompleteInput
              value={birthCity}
              onChangeText={setBirthCity}
              onSelectCity={(city) => setBirthCityCoords(city?.lat ?? null, city?.lon ?? null)}
              placeholder={t("onboarding.birthDate.placePlaceholder")}
            />
          </GlassCard>
        </View>
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xl },
  wheelWrap: { alignItems: "center", marginBottom: spacing.lg },
  card: { marginBottom: spacing.sm },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowValue: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  label: {
    color: colors.textTertiary,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
    marginBottom: spacing.xs,
  },
  value: {
    color: colors.textPrimary,
    fontFamily: typography.bodyLg.fontFamily,
    fontSize: 15.5,
    fontWeight: "600",
  },
  picker: { alignSelf: "stretch", marginTop: spacing.xs },
  doneBtn: { alignSelf: "flex-end", paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  doneBtnText: {
    color: colors.gold,
    fontFamily: typography.label.fontFamily,
    fontSize: 13,
    fontWeight: "700",
  },
});
