import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Platform, Pressable } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format } from "date-fns";
import Svg, { Path } from "react-native-svg";
import { ScreenBackground, GlassCard, GlowButton, OrnateFrame, ZodiacIcon } from "@shared/components";
import { colors, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { useFriendsStore } from "@shared/storage/useFriendsStore";
import { useAuthStore } from "@shared/storage/useAuthStore";
import { isFirebaseConfigured } from "@shared/firebase/firebaseClient";
import { upsertFriendRemote } from "@shared/firebase/firestoreFriends";
import { getZodiacSign } from "@shared/utils/astrology";
import { ProfileStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<ProfileStackParamList, "AddFriend">;

const DEFAULT_DATE = new Date(1996, 5, 15);

function Chevron() {
  return (
    <Svg width={9} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M9 5l7 7-7 7" stroke={colors.gold} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function AddFriendScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const addFriend = useFriendsStore((s) => s.addFriend);
  const uid = useAuthStore((s) => s.uid);

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState<Date>(DEFAULT_DATE);
  const [showPicker, setShowPicker] = useState(false);

  const sunSign = getZodiacSign(birthDate.getMonth() + 1, birthDate.getDate());
  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    const friend = addFriend({
      name: name.trim(),
      birthDate: format(birthDate, "yyyy-MM-dd"),
      sunSign,
    });
    if (uid && isFirebaseConfigured()) upsertFriendRemote(uid, friend).catch(() => {});
    navigation.goBack();
  };

  return (
    <ScreenBackground variant="night">
      <OrnateFrame />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 5l-7 7 7 7" stroke={colors.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>{t("friends.addTitle")}</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.content}>
        <View style={styles.previewWrap}>
          <ZodiacIcon sign={sunSign} size={64} variant="filled" sparkles />
        </View>

        <GlassCard style={styles.card}>
          <Text style={styles.label}>{t("friends.nameLabel").toUpperCase()}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t("friends.namePlaceholder")}
            placeholderTextColor={colors.textTertiary}
            style={styles.input}
            autoFocus
          />
        </GlassCard>

        <GlassCard style={styles.card}>
          <Pressable style={styles.rowBetween} onPress={() => setShowPicker((s) => !s)}>
            <Text style={styles.label}>{t("friends.birthDateLabel").toUpperCase()}</Text>
            <View style={styles.rowValue}>
              <Text style={styles.value}>{format(birthDate, "MMM d, yyyy")}</Text>
              <Chevron />
            </View>
          </Pressable>
          {showPicker && (
            <DateTimePicker
              value={birthDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={new Date()}
              onChange={(_, selected) => selected && setBirthDate(selected)}
              themeVariant="dark"
              textColor={colors.textPrimary}
              style={styles.picker}
            />
          )}
        </GlassCard>

        <GlowButton title={t("friends.save")} onPress={handleSave} disabled={!canSave} style={{ marginTop: spacing.lg }} />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  backBtn: { width: 34, height: 34, justifyContent: "center" },
  headerTitle: { color: colors.gold, fontFamily: typography.h3.fontFamily, fontSize: 17, letterSpacing: 1.4 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  previewWrap: { alignItems: "center", marginBottom: spacing.lg },
  card: { marginBottom: spacing.sm },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowValue: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  label: {
    color: colors.textTertiary,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
    marginBottom: spacing.xs,
  },
  value: { color: colors.textPrimary, fontFamily: typography.bodyLg.fontFamily, fontSize: 15.5, fontWeight: "600" },
  picker: { alignSelf: "stretch", marginTop: spacing.xs },
  input: { color: colors.textPrimary, fontFamily: typography.body.fontFamily, fontSize: 16, paddingVertical: spacing.xs },
});
