import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, Platform } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { FontAwesome5 } from "@expo/vector-icons";
import { ScreenBackground, GlassCard, GlowButton, OrnateFrame, NatalWheelSVG } from "@shared/components";
import { colors, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithApple,
  signInWithGoogle,
  isAppleSignInAvailable,
  AuthActionError,
  OAuthCancelledError,
} from "@shared/firebase/authActions";
import { isFirebaseConfigured } from "@shared/firebase/firebaseClient";
import { ProfileStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<ProfileStackParamList, "Auth">;

export function AuthScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState<"apple" | "google" | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  const handleSubmit = async () => {
    setError(null);
    if (mode === "signUp" && password !== confirmPassword) {
      setError(t("auth.error.passwordMismatch"));
      return;
    }
    setLoading(true);
    try {
      if (mode === "signIn") await signInWithEmail(email, password);
      else await signUpWithEmail(email, password);
      navigation.goBack();
    } catch (err) {
      const code = err instanceof AuthActionError ? err.code : "generic";
      setError(t(`auth.error.${code}`));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "apple" | "google") => {
    setError(null);
    setOauthLoading(provider);
    try {
      if (provider === "apple") await signInWithApple();
      else await signInWithGoogle();
      navigation.goBack();
    } catch (err) {
      if (err instanceof OAuthCancelledError) return;
      const code = err instanceof AuthActionError ? err.code : "generic";
      setError(t(`auth.error.${code}`));
    } finally {
      setOauthLoading(null);
    }
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
        <Text style={styles.headerTitle}>{t("auth.title")}</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.content}>
        <View style={styles.wheelWrap}>
          <NatalWheelSVG size={100} showGlyphs showTicks={false} showInnerChart={false} opacity={0.7} />
        </View>

        {!isFirebaseConfigured() && (
          <GlassCard style={styles.card}>
            <Text style={styles.notConfigured}>{t("auth.error.notConfigured")}</Text>
          </GlassCard>
        )}

        <Text style={styles.fieldLabel}>{t("auth.email").toUpperCase()}</Text>
        <GlassCard style={styles.card}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={colors.textTertiary}
            style={styles.input}
            editable={isFirebaseConfigured()}
          />
        </GlassCard>

        <Text style={styles.fieldLabel}>{t("auth.password").toUpperCase()}</Text>
        <GlassCard style={styles.card}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.textTertiary}
            style={styles.input}
            editable={isFirebaseConfigured()}
          />
        </GlassCard>

        {mode === "signUp" && (
          <>
            <Text style={styles.fieldLabel}>{t("auth.confirmPassword").toUpperCase()}</Text>
            <GlassCard style={styles.card}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={colors.textTertiary}
                style={styles.input}
                editable={isFirebaseConfigured()}
              />
            </GlassCard>
          </>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        <GlowButton
          title={mode === "signIn" ? t("auth.signInCta") : t("auth.signUpCta")}
          onPress={handleSubmit}
          disabled={
            !isFirebaseConfigured() ||
            !email ||
            !password ||
            loading ||
            (mode === "signUp" && !confirmPassword)
          }
          loading={loading}
          style={{ marginTop: spacing.md }}
        />

        <Pressable
          onPress={() => {
            setMode(mode === "signIn" ? "signUp" : "signIn");
            setConfirmPassword("");
            setError(null);
          }}
          style={styles.switchModeBtn}
        >
          <Text style={styles.switchModeText}>{mode === "signIn" ? t("auth.switchToSignUp") : t("auth.switchToSignIn")}</Text>
        </Pressable>

        <Pressable onPress={() => navigation.goBack()} style={styles.guestBtn}>
          <Text style={styles.guestText}>{t("auth.continueAsGuest")}</Text>
        </Pressable>

        <View style={styles.oauthRow}>
          {Platform.OS === "ios" && appleAvailable && (
            <Pressable
              onPress={() => handleOAuth("apple")}
              disabled={!isFirebaseConfigured() || oauthLoading !== null}
              style={[styles.oauthBtn, { opacity: isFirebaseConfigured() ? 1 : 0.5 }]}
            >
              {oauthLoading === "apple" ? (
                <ActivityIndicator size="small" color={colors.textPrimary} />
              ) : (
                <>
                  <FontAwesome5 name="apple" size={16} color={colors.textPrimary} />
                  <Text style={styles.oauthText}>{t("auth.continueWithApple")}</Text>
                </>
              )}
            </Pressable>
          )}
          <Pressable
            onPress={() => handleOAuth("google")}
            disabled={!isFirebaseConfigured() || oauthLoading !== null}
            style={[styles.oauthBtn, { opacity: isFirebaseConfigured() ? 1 : 0.5 }]}
          >
            {oauthLoading === "google" ? (
              <ActivityIndicator size="small" color={colors.textPrimary} />
            ) : (
              <>
                <FontAwesome5 name="google" size={15} color={colors.textPrimary} />
                <Text style={styles.oauthText}>{t("auth.continueWithGoogle")}</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  backBtn: { width: 34, height: 34, justifyContent: "center" },
  headerTitle: { color: colors.gold, fontFamily: typography.h3.fontFamily, fontSize: 17, letterSpacing: 1.4 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  wheelWrap: { alignItems: "center", marginBottom: spacing.md },
  card: { marginBottom: spacing.sm },
  fieldLabel: {
    color: colors.textTertiary,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
    marginBottom: spacing.xs,
    marginLeft: 2,
  },
  input: { color: colors.textPrimary, fontFamily: typography.body.fontFamily, fontSize: 16, paddingVertical: spacing.xs },
  notConfigured: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 13, lineHeight: 19 },
  error: { color: colors.accent, fontFamily: typography.body.fontFamily, fontSize: 13, marginTop: spacing.xs },
  switchModeBtn: { alignItems: "center", marginTop: spacing.lg },
  switchModeText: { color: colors.gold, fontFamily: typography.body.fontFamily, fontSize: 13.5 },
  guestBtn: { alignItems: "center", marginTop: spacing.sm },
  guestText: { color: colors.textTertiary, fontFamily: typography.body.fontFamily, fontSize: 13 },
  oauthRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xl },
  oauthBtn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    opacity: 0.5,
  },
  oauthText: { color: colors.textTertiary, fontSize: 11.5, fontFamily: typography.label.fontFamily },
});
