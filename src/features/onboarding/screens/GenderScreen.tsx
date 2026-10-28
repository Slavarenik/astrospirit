import React from "react";
import { View, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { OnboardingLayout } from "../components/OnboardingLayout";
import { ChoiceCard } from "../components/ChoiceCard";
import { GlowButton } from "@shared/components";
import { useOnboardingDraft } from "../onboardingDraftStore";
import { GENDERS, Gender } from "@shared/types/user";
import { useT } from "@shared/i18n";
import { OnboardingStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Gender">;

const ICONS: Record<Gender, string> = {
  Female: "♀",
  Male: "♂",
  "Non-binary": "⚥",
  "Prefer not to say": "✦",
};

export function GenderScreen({ navigation }: Props) {
  const { gender, setGender } = useOnboardingDraft();
  const t = useT();

  return (
    <OnboardingLayout
      step={1}
      totalSteps={4}
      title={t("onboarding.gender.title")}
      subtitle={t("onboarding.gender.subtitle")}
      onBack={() => navigation.goBack()}
      footer={
        <GlowButton
          title={t("common.continue")}
          disabled={!gender}
          onPress={() => navigation.navigate("BirthDate")}
        />
      }
    >
      <View style={styles.grid}>
        {GENDERS.map((g) => (
          <ChoiceCard
            key={g}
            label={t(`onboarding.gender.options.${g}`)}
            icon={ICONS[g]}
            selected={gender === g}
            onPress={() => setGender(g)}
          />
        ))}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
});
