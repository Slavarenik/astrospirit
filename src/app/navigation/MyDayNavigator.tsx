import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MyDayStackParamList } from "./types";
import { MyDayHomeScreen } from "@features/my-day/screens/MyDayHomeScreen";
import { CardDrawScreen } from "@features/tarot/screens/CardDrawScreen";
import { TarotSpreadIntroScreen } from "@features/tarot/screens/TarotSpreadIntroScreen";
import { TarotSpreadScreen } from "@features/tarot/screens/TarotSpreadScreen";
import { CelticCrossScreen } from "@features/tarot/screens/CelticCrossScreen";
import { YesNoScreen } from "@features/tarot/screens/YesNoScreen";
import { CrossSpreadScreen } from "@features/tarot/screens/CrossSpreadScreen";
import { ChoiceSpreadScreen } from "@features/tarot/screens/ChoiceSpreadScreen";
import { HorseshoeScreen } from "@features/tarot/screens/HorseshoeScreen";
import { StationForTwoScreen } from "@features/tarot/screens/StationForTwoScreen";
import { TarotHistoryScreen } from "@features/tarot/screens/TarotHistoryScreen";

const Stack = createNativeStackNavigator<MyDayStackParamList>();

export function MyDayNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyDayHome" component={MyDayHomeScreen} />
      <Stack.Screen
        name="CardDraw"
        component={CardDrawScreen}
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      {/* Spreads deliberately aren't a modal — a full screen (default push)
          so the intro/preview gets real room, not a bottom sheet. */}
      <Stack.Screen name="TarotSpreadIntro" component={TarotSpreadIntroScreen} />
      <Stack.Screen name="TarotSpread" component={TarotSpreadScreen} />
      <Stack.Screen name="CelticCross" component={CelticCrossScreen} />
      <Stack.Screen name="YesNoSpread" component={YesNoScreen} />
      <Stack.Screen name="CrossSpread" component={CrossSpreadScreen} />
      <Stack.Screen name="ChoiceSpread" component={ChoiceSpreadScreen} />
      <Stack.Screen name="Horseshoe" component={HorseshoeScreen} />
      <Stack.Screen name="StationForTwo" component={StationForTwoScreen} />
      <Stack.Screen name="TarotHistory" component={TarotHistoryScreen} />
    </Stack.Navigator>
  );
}
