import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "./types";
import { CustomTabBar } from "./CustomTabBar";
import { MyDayNavigator } from "./MyDayNavigator";
import { CalendarNavigator } from "./CalendarNavigator";
import { NumerologyNavigator } from "./NumerologyNavigator";
import { ProfileNavigator } from "./ProfileNavigator";

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="MyDay" component={MyDayNavigator} />
      <Tab.Screen name="Calendar" component={CalendarNavigator} />
      <Tab.Screen name="Numerology" component={NumerologyNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}
