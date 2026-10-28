import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "./types";
import { ProfileHomeScreen } from "@features/profile/screens/ProfileHomeScreen";
import { CompatibilityScreen } from "@features/profile/screens/CompatibilityScreen";
import { FullChartScreen } from "@features/profile/screens/FullChartScreen";
import { AspectsScreen } from "@features/profile/screens/AspectsScreen";
import { FriendsScreen } from "@features/friends/screens/FriendsScreen";
import { AddFriendScreen } from "@features/friends/screens/AddFriendScreen";
import { AuthScreen } from "@features/friends/screens/AuthScreen";
import { FriendMatchScreen } from "@features/friends/screens/FriendMatchScreen";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileHomeScreen} />
      <Stack.Screen
        name="Compatibility"
        component={CompatibilityScreen}
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="FullChart"
        component={FullChartScreen}
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="Aspects"
        component={AspectsScreen}
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="Friends"
        component={FriendsScreen}
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="AddFriend"
        component={AddFriendScreen}
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="FriendMatch"
        component={FriendMatchScreen}
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
    </Stack.Navigator>
  );
}
