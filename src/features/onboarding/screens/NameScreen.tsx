import React, { useState } from "react";
import { TextInput, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { OnboardingLayout } from "../components/OnboardingLayout";
import { GlowButton } from "@shared/components";
import { useOnboardingDraft } from "../onboardingDraftStore";
import { colors, radius, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { OnboardingStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Name">;

export function NameScreen({ navigation }: Props) {
  const { name, setName } = useOnboardingDraft();
  const [local, setLocal] = useState(name);
  const t = useT();

  return (
    <OnboardingLayout
      step={0}
      totalSteps={4}
      title={t("onboarding.name.title")}
      subtitle={t("onboarding.name.subtitle")}
      onBack={() => navigation.goBack()}
      footer={
        <GlowButton
          title={t("common.continue")}
          disabled={local.trim().length < 1}
          onPress={() => {
            setName(local.trim());
            navigation.navigate("Gender");
          }}
        />
      }
    >
      <TextInput
        value={local}
        onChangeText={setLocal}
        placeholder={t("onboarding.name.placeholder")}
        placeholderTextColor={colors.textTertiary}
        style={styles.input}
        autoFocus
        returnKeyType="done"
        maxLength={40}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
    backgroundColor: colors.bg2,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    color: colors.textPrimary,
    fontFamily: typography.h3.fontFamily,
    fontSize: 19,
    textAlign: "center",
  },
});
