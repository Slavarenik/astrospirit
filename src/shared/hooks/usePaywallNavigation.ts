import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@app/navigation/types";

/** The Paywall screen lives on the root stack (so it can present as a modal
 *  over any tab), while most call sites are nested a couple of navigators
 *  deep (Root -> MainTabNavigator -> a tab's own Stack -> the screen).
 *  Walk .getParent() up until there's no further parent, landing on the
 *  root stack regardless of how deep the call site is. */
export function usePaywallNavigation() {
  const navigation = useNavigation();
  return () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let nav: any = navigation;
    while (nav.getParent && nav.getParent()) nav = nav.getParent();
    (nav as NativeStackNavigationProp<RootStackParamList>).navigate("Paywall");
  };
}
