import React, { useEffect } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { FontAwesome5 } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@shared/theme";

const ICON_NAMES: Record<string, React.ComponentProps<typeof FontAwesome5>["name"]> = {
  MyDay: "sun",
  Calendar: "moon",
  Numerology: "hashtag",
  Profile: "user",
};

function TabGlyph({ routeName, color }: { routeName: string; color: string }) {
  return <FontAwesome5 name={ICON_NAMES[routeName] ?? "star"} size={19} color={color} solid />;
}

function TabIcon({ routeName, focused }: { routeName: string; focused: boolean }) {
  const scale = useSharedValue(1);
  const pillWidth = useSharedValue(focused ? 48 : 0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.08 : 1, { damping: 10, stiffness: 180 });
    pillWidth.value = withTiming(focused ? 48 : 0, { duration: 260 });
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const pillStyle = useAnimatedStyle(() => ({
    width: pillWidth.value,
    opacity: pillWidth.value / 48,
  }));

  return (
    <View style={styles.iconSlot}>
      <Animated.View style={[styles.pill, pillStyle]} />
      <Animated.View style={iconStyle}>
        <TabGlyph routeName={routeName} color={focused ? colors.textOnAccent : colors.textSecondary} />
      </Animated.View>
    </View>
  );
}

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.bar}>
        <View style={styles.inner}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            return (
              <Pressable
                key={route.key}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  if (!focused) navigation.navigate(route.name as never);
                }}
                style={styles.tabBtn}
                hitSlop={8}
              >
                <TabIcon routeName={route.name} focused={focused} />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: 0,
    alignItems: "center",
  },
  bar: {
    borderRadius: radius.pill,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
    backgroundColor: colors.bg1,
  },
  inner: {
    flexDirection: "row",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  tabBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  iconSlot: {
    width: 48,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    position: "absolute",
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
});
