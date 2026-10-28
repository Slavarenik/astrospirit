import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NumerologyStackParamList } from "./types";
import { NumerologyHomeScreen } from "@features/numerology/screens/NumerologyHomeScreen";
import { NumerologyMatchScreen } from "@features/numerology/screens/NumerologyMatchScreen";

const Stack = createNativeStackNavigator<NumerologyStackParamList>();

export function NumerologyNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NumerologyHome" component={NumerologyHomeScreen} />
      <Stack.Screen
        name="NumerologyMatch"
        component={NumerologyMatchScreen}
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
    </Stack.Navigator>
  );
}
