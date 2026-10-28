import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SanctuaryStackParamList } from "./types";
import { SanctuaryHomeScreen } from "@features/sanctuary/screens/SanctuaryHomeScreen";
import { PlayerScreen } from "@features/sanctuary/screens/PlayerScreen";

const Stack = createNativeStackNavigator<SanctuaryStackParamList>();

export function SanctuaryNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SanctuaryHome" component={SanctuaryHomeScreen} />
      <Stack.Screen
        name="Player"
        component={PlayerScreen}
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
    </Stack.Navigator>
  );
}
