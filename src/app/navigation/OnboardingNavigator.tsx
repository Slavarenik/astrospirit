import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OnboardingStackParamList } from "./types";
import { WelcomeScreen } from "@features/onboarding/screens/WelcomeScreen";
import { NameScreen } from "@features/onboarding/screens/NameScreen";
import { GenderScreen } from "@features/onboarding/screens/GenderScreen";
import { BirthDateScreen } from "@features/onboarding/screens/BirthDateScreen";
import { RelationshipStatusScreen } from "@features/onboarding/screens/RelationshipStatusScreen";
import { GeneratingScreen } from "@features/onboarding/screens/GeneratingScreen";

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Name" component={NameScreen} />
      <Stack.Screen name="Gender" component={GenderScreen} />
      <Stack.Screen name="BirthDate" component={BirthDateScreen} />
      <Stack.Screen name="RelationshipStatus" component={RelationshipStatusScreen} />
      <Stack.Screen name="Generating" component={GeneratingScreen} options={{ gestureEnabled: false }} />
    </Stack.Navigator>
  );
}
