import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GlassCard, FadeInUp, GlowButton } from "@shared/components";
import { colors, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { useAuthStore } from "@shared/storage/useAuthStore";
import { signOutUser } from "@shared/firebase/authActions";
import { isFirebaseConfigured } from "@shared/firebase/firebaseClient";
import { ProfileStackParamList } from "@app/navigation/types";

export function AccountCard() {
  const t = useT();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const uid = useAuthStore((s) => s.uid);
  const email = useAuthStore((s) => s.email);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOutUser();
    } catch {
      // Best-effort — the auth listener will reflect whatever Firebase's
      // real state ends up being either way.
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <FadeInUp delay={250}>
      <GlassCard>
        <Text style={styles.title}>{t("auth.title")}</Text>
        {uid ? (
          <>
            <Text style={styles.subtitle}>{t("auth.signedInAs").replace("{{email}}", email ?? "")}</Text>
            <GlowButton
              title={t("auth.signOut")}
              variant="outline"
              onPress={handleSignOut}
              loading={signingOut}
              style={{ marginTop: spacing.md, alignSelf: "flex-start" }}
            />
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>{isFirebaseConfigured() ? t("auth.guestNotice") : t("auth.error.notConfigured")}</Text>
            <GlowButton
              title={t("auth.signIn")}
              variant="outline"
              onPress={() => navigation.navigate("Auth")}
              style={{ marginTop: spacing.md, alignSelf: "flex-start" }}
            />
          </>
        )}
      </GlassCard>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.gold, fontFamily: typography.h3.fontFamily, fontSize: 17 },
  subtitle: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 13.5, marginTop: 4, lineHeight: 19 },
});
