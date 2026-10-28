import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CalendarStackParamList } from "./types";
import { CalendarHomeScreen } from "@features/calendar/screens/CalendarHomeScreen";
import { EveningJournalScreen } from "@features/calendar/screens/EveningJournalScreen";
import { JournalInsightsScreen } from "@features/calendar/screens/JournalInsightsScreen";

const Stack = createNativeStackNavigator<CalendarStackParamList>();

export function CalendarNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarHome" component={CalendarHomeScreen} />
      <Stack.Screen
        name="EveningJournal"
        component={EveningJournalScreen}
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen name="JournalInsights" component={JournalInsightsScreen} />
    </Stack.Navigator>
  );
}
