import React from "react";
import { View, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { OnboardingLayout } from "../components/OnboardingLayout";
import { ChoiceCard } from "../components/ChoiceCard";
import { GlowButton } from "@shared/components";
import { useOnboardingDraft } from "../onboardingDraftStore";
import { RELATIONSHIP_STATUSES, RelationshipStatus } from "@shared/types/user";
import { useT } from "@shared/i18n";
import { OnboardingStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<OnboardingStackParamList, "RelationshipStatus">;

const ICONS: Record<RelationshipStatus, string> = {
  Soulmate: "✦",
  Engaged: "💍",
  Married: "♾",
  Difficult: "🌧",
  Single: "🌙",
};

export function RelationshipStatusScreen({ navigation }: Props) {
  const { relationshipStatus, setRelationshipStatus } = useOnboardingDraft();
  const t = useT();

  return (
    <OnboardingLayout
      step={3}
      totalSteps={4}
      title={t("onboarding.relationship.title")}
      subtitle={t("onboarding.relationship.subtitle")}
      onBack={() => navigation.goBack()}
      footer={
        <GlowButton
          title={t("onboarding.relationship.reveal")}
          disabled={!relationshipStatus}
          onPress={() => navigation.navigate("Generating")}
        />
      }
    >
      <View style={styles.grid}>
        {RELATIONSHIP_STATUSES.map((status) => (
          <ChoiceCard
            key={status}
            label={t(`onboarding.relationship.options.${status}.label`)}
            description={t(`onboarding.relationship.options.${status}.description`)}
            icon={ICONS[status]}
            selected={relationshipStatus === status}
            onPress={() => setRelationshipStatus(status)}
          />
        ))}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
});
