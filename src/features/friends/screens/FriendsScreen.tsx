import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { ScreenBackground, GlassCard, ZodiacIcon, OrnateFrame, GlowButton, FadeInUp } from "@shared/components";
import { colors, radius, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { useFriendsStore } from "@shared/storage/useFriendsStore";
import { useAuthStore } from "@shared/storage/useAuthStore";
import { usePremiumStore } from "@shared/storage/usePremiumStore";
import { usePaywallNavigation } from "@shared/hooks/usePaywallNavigation";
import { isFirebaseConfigured } from "@shared/firebase/firebaseClient";
import { deleteFriendRemote } from "@shared/firebase/firestoreFriends";
import { ProfileStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<ProfileStackParamList, "Friends">;

export function FriendsScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const friends = useFriendsStore((s) => s.friends);
  const removeFriend = useFriendsStore((s) => s.removeFriend);
  const syncedWithCloud = useFriendsStore((s) => s.syncedWithCloud);
  const uid = useAuthStore((s) => s.uid);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const goToPaywall = usePaywallNavigation();

  const handleRemove = (id: string, name: string) => {
    Alert.alert(
      t("friends.removeConfirmTitle"),
      t("friends.removeConfirmBody").replace("{{name}}", name),
      [
        { text: t("friends.cancel"), style: "cancel" },
        {
          text: t("friends.remove"),
          style: "destructive",
          onPress: () => {
            removeFriend(id);
            if (uid && isFirebaseConfigured()) deleteFriendRemote(uid, id).catch(() => {});
          },
        },
      ]
    );
  };

  if (!isPremium) {
    return (
      <ScreenBackground variant="night">
        <OrnateFrame />
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M15 5l-7 7 7 7" stroke={colors.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <Text style={styles.headerTitle}>{t("friends.title")}</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.lockedWrap}>
          <GlassCard glow sparkles style={styles.lockedCard}>
            <Text style={styles.lockedTitle}>{t("friends.premiumLocked.title")}</Text>
            <Text style={styles.lockedBody}>{t("friends.premiumLocked.body")}</Text>
            <GlowButton title={t("friends.premiumLocked.cta")} onPress={goToPaywall} style={{ marginTop: spacing.md }} />
          </GlassCard>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground variant="night">
      <OrnateFrame />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 5l-7 7 7 7" stroke={colors.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>{t("friends.title")}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Text style={styles.subtitle}>{t("friends.subtitle")}</Text>

        {!uid && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{isFirebaseConfigured() ? t("friends.signInToSync") : t("friends.localOnlyNotice")}</Text>
          </View>
        )}
        {!!uid && syncedWithCloud && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>✦ {t("friends.title")} synced</Text>
          </View>
        )}

        <GlowButton title={t("friends.add")} onPress={() => navigation.navigate("AddFriend")} style={{ marginTop: spacing.md }} />

        {friends.length === 0 ? (
          <FadeInUp delay={150}>
            <GlassCard style={{ marginTop: spacing.lg }}>
              <Text style={styles.empty}>{t("friends.empty")}</Text>
            </GlassCard>
          </FadeInUp>
        ) : (
          <View style={{ marginTop: spacing.lg }}>
            {friends.map((friend, i) => (
              <Animated.View key={friend.id} entering={FadeInDown.duration(320).delay(i * 60)}>
                <GlassCard style={styles.friendCard}>
                  <Pressable
                    style={styles.friendRow}
                    onPress={() => navigation.navigate("FriendMatch", { friendId: friend.id })}
                    onLongPress={() => handleRemove(friend.id, friend.name)}
                  >
                    <ZodiacIcon sign={friend.sunSign} size={46} variant="ring" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <Text style={styles.friendSign}>{t(`signs.${friend.sunSign}`)}</Text>
                    </View>
                    <GlowButton
                      title={t("friends.viewMatch")}
                      variant="outline"
                      onPress={() => navigation.navigate("FriendMatch", { friendId: friend.id })}
                    />
                  </Pressable>
                </GlassCard>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  backBtn: { width: 34, height: 34, justifyContent: "center" },
  headerTitle: { color: colors.gold, fontFamily: typography.h3.fontFamily, fontSize: 17, letterSpacing: 1.4 },
  content: { paddingHorizontal: spacing.lg },
  subtitle: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 14, marginTop: spacing.xs },
  notice: {
    backgroundColor: colors.bg2,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
  },
  noticeText: { color: colors.textTertiary, fontSize: 12.5, fontFamily: typography.body.fontFamily },
  empty: { color: colors.textTertiary, fontFamily: typography.body.fontFamily, fontSize: 14, textAlign: "center" },
  friendCard: { marginBottom: spacing.sm },
  friendRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  friendName: { color: colors.textPrimary, fontFamily: typography.h3.fontFamily, fontSize: 15.5 },
  friendSign: { color: colors.textTertiary, fontFamily: typography.body.fontFamily, fontSize: 12.5, marginTop: 2 },
  lockedWrap: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: "center" },
  lockedCard: { alignItems: "center" },
  lockedTitle: { color: colors.gold, fontFamily: typography.h2.fontFamily, fontSize: 19, textAlign: "center" },
  lockedBody: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontSize: 13.5,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 19,
  },
});
