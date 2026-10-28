import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import ViewShot from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import Svg, { Path } from "react-native-svg";
import { FadeInUp, NatalWheelSVG, CornerSparkle, GlowButton } from "@shared/components";
import { colors, radius, spacing, typography } from "@shared/theme";
import { useT, useTranslatedText, useTranslatedTexts } from "@shared/i18n";
import { logShareBlock } from "@shared/analytics/analytics";
import { usePremiumStore } from "@shared/storage/usePremiumStore";
import { usePaywallNavigation } from "@shared/hooks/usePaywallNavigation";
import { useDailyHoroscope } from "../hooks/useDailyHoroscope";
import { useAffirmationDetail } from "../hooks/useAffirmationDetail";

function IconButton({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} style={styles.iconBtn} hitSlop={8}>
      {children}
    </Pressable>
  );
}

// Matches the outline GlowButton's own label color, since this only ever
// sits inside that variant here (same convention as AstroPassportCard).
function LockIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
      <Path d="M6 11V8a6 6 0 1112 0v3" stroke={colors.gold} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M5 11h14v9H5z" stroke={colors.gold} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

export function AffirmationWidget() {
  const t = useT();
  const { affirmation, sign } = useDailyHoroscope();
  const { text: affirmationText } = useTranslatedText(affirmation);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const goToPaywall = usePaywallNavigation();
  const detail = useAffirmationDetail();
  const { texts: detailTexts } = useTranslatedTexts([detail.moonFlavor, detail.risingFlavor]);
  const shotRef = useRef<ViewShot>(null);
  const [busy, setBusy] = useState(false);

  const handleDetailPress = () => {
    if (isPremium) return;
    goToPaywall();
  };

  const capture = async (): Promise<string | null> => {
    try {
      // @ts-expect-error — capture exists at runtime on the ref
      const uri: string = await shotRef.current?.capture?.();
      return uri ?? null;
    } catch {
      return null;
    }
  };

  const handleSaveWallpaper = async () => {
    setBusy(true);
    try {
      const uri = await capture();
      if (!uri) throw new Error("capture failed");
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Allow photo access to save this as wallpaper.");
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Saved", "Affirmation saved to your photos.");
    } catch {
      Alert.alert("Couldn't save", "Something went wrong saving the image.");
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    setBusy(true);
    try {
      const uri = await capture();
      if (!uri) throw new Error("capture failed");
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri);
        logShareBlock("affirmation");
      }
    } catch {
      Alert.alert("Couldn't share", "Something went wrong sharing the image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <FadeInUp delay={200}>
      <ViewShot ref={shotRef} options={{ format: "png", quality: 1 }}>
        <View style={styles.wrap}>
          <View style={styles.wheelDeco} pointerEvents="none">
            <NatalWheelSVG size={220} opacity={0.14} showInnerChart={false} />
          </View>
          <View style={styles.cornerTL} pointerEvents="none">
            <CornerSparkle size={11} color={colors.gold} opacity={0.6} />
          </View>
          <View style={styles.cornerBR} pointerEvents="none">
            <CornerSparkle size={11} color={colors.gold} opacity={0.6} />
          </View>
          <Text style={styles.eyebrow}>{t("affirmation.eyebrow")} · {t(`signs.${sign}`).toUpperCase()}</Text>
          <Text style={styles.quote}>"{affirmationText}"</Text>

          <View style={styles.actionRow}>
            <IconButton onPress={handleSaveWallpaper}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M4 16l4.5-5.5a2 2 0 013 0L15 14M14 13l1.5-1.8a2 2 0 013 0L21 14" stroke={colors.textPrimary} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" stroke={colors.textPrimary} strokeWidth={1.7} />
                <Path d="M8 9a1 1 0 100-2 1 1 0 000 2z" fill={colors.textPrimary} />
              </Svg>
              <Text style={styles.iconLabel}>{t("affirmation.save")}</Text>
            </IconButton>
            <IconButton onPress={handleShare}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M12 3v12M12 3l-4 4M12 3l4 4" stroke={colors.textPrimary} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4" stroke={colors.textPrimary} strokeWidth={1.7} strokeLinecap="round" />
              </Svg>
              <Text style={styles.iconLabel}>{t("affirmation.share")}</Text>
            </IconButton>
          </View>
        </View>
      </ViewShot>

      <View style={styles.detailCard}>
        {isPremium ? (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("passport.moon").toUpperCase()}</Text>
              <Text style={styles.detailText}>{detailTexts[0]}</Text>
            </View>
            <View style={[styles.detailRow, { marginTop: spacing.sm }]}>
              <Text style={styles.detailLabel}>{t("passport.rising").toUpperCase()}</Text>
              <Text style={styles.detailText}>{detailTexts[1]}</Text>
            </View>
          </>
        ) : (
          <GlowButton
            title={t("affirmation.unlockDetailed")}
            variant="outline"
            icon={<LockIcon />}
            onPress={handleDetailPress}
            style={{ alignSelf: "stretch" }}
          />
        )}
      </View>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
    backgroundColor: colors.bg2,
  },
  wheelDeco: { position: "absolute", right: -60, top: -60 },
  cornerTL: { position: "absolute", top: 10, left: 10 },
  cornerBR: { position: "absolute", bottom: 10, right: 10 },
  eyebrow: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
    marginBottom: spacing.sm,
  },
  quote: {
    color: colors.textPrimary,
    fontFamily: typography.h2.fontFamily,
    fontSize: 21,
    lineHeight: 29,
    marginBottom: spacing.lg,
  },
  actionRow: { flexDirection: "row", gap: spacing.lg },
  iconBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  iconLabel: { color: colors.textPrimary, fontFamily: typography.caption.fontFamily, fontSize: 13 },
  detailCard: {
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
    backgroundColor: colors.bg2,
    padding: spacing.md,
  },
  detailRow: {},
  detailLabel: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
    marginBottom: 4,
  },
  detailText: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 13.5, lineHeight: 19 },
});
