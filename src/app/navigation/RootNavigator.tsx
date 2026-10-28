import React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { OnboardingNavigator } from "./OnboardingNavigator";
import { MainTabNavigator } from "./MainTabNavigator";
import { PaywallScreen } from "@features/paywall/screens/PaywallScreen";
import { useUserStore } from "@shared/storage/useUserStore";
import { colors } from "@shared/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg0,
    card: colors.bg0,
    primary: colors.accent,
    text: colors.textPrimary,
    border: colors.hairline,
  },
};

export function RootNavigator() {
  const onboardingComplete = useUserStore((s) => s.profile?.onboardingComplete ?? false);

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
        {onboardingComplete ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        )}
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
