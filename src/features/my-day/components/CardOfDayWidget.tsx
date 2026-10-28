import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Image, Pressable, Alert } from "react-native";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GlassCard, FadeInUp, GlowButton, ShareButton } from "@shared/components";
import { colors, radius, spacing, typography } from "@shared/theme";
import { useT, useTranslatedText } from "@shared/i18n";
import { logShareBlock } from "@shared/analytics/analytics";
import { useCardOfDayStore, todayKey } from "@shared/storage/useCardOfDayStore";
import { getCardById } from "@features/tarot/data/tarotCatalog";
import { CARD_IMAGES } from "@features/tarot/data/cardImages";
import { MyDayStackParamList } from "@app/navigation/types";

export function CardOfDayWidget() {
  const t = useT();
  const navigation = useNavigation<NativeStackNavigationProp<MyDayStackParamList>>();
  const drawn = useCardOfDayStore((s) => s.drawn);
  const isToday = drawn?.dateKey === todayKey();
  const card = isToday && drawn ? getCardById(drawn.cardId) : null;
  const englishMeaning = card
    ? drawn?.reversed
      ? card.meaning.reversed
      : card.meaning.upright
    : "";
  const { text: meaning } = useTranslatedText(englishMeaning);

  const shotRef = useRef<ViewShot>(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      const uri: string | undefined = await shotRef.current?.capture?.();
      if (!uri) throw new Error("capture failed");
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri);
        logShareBlock("tarot");
      }
    } catch {
      Alert.alert("Couldn't share", "Something went wrong sharing the image.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <FadeInUp delay={120}>
      <ViewShot ref={shotRef} options={{ format: "png", quality: 1 }}>
        <GlassCard sparkles>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{t("cardOfDay.title")}</Text>
              <Text style={styles.subtitle}>{t("cardOfDay.subtitle")}</Text>
            </View>
            {card && <ShareButton onPress={handleShare} busy={sharing} />}
          </View>

          {card ? (
            <Pressable
              style={styles.drawnRow}
              onPress={() => navigation.navigate("CardDraw", { context: undefined })}
            >
              <Image source={CARD_IMAGES[card.id]} style={styles.thumb} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName}>
                  {card.name}
                  {drawn?.reversed ? ` ${t("cardOfDay.reversed")}` : ""}
                </Text>
                <Text style={styles.cardMeaning} numberOfLines={3}>
                  {meaning}
                </Text>
                <Text style={styles.link}>{t("cardOfDay.viewFull")}</Text>
              </View>
            </Pressable>
          ) : (
            <View style={styles.ctaWrap}>
              <Text style={styles.ctaText}>{t("cardOfDay.cta")}</Text>
              <GlowButton
                title={t("cardOfDay.draw")}
                variant="outline"
                onPress={() => navigation.navigate("CardDraw", { context: undefined })}
              />
            </View>
          )}
        </GlassCard>
      </ViewShot>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.sm, gap: spacing.sm },
  title: { color: colors.textPrimary, fontFamily: typography.h3.fontFamily, fontSize: 17 },
  subtitle: { color: colors.textTertiary, fontFamily: typography.caption.fontFamily, fontSize: typography.caption.fontSize },
  ctaWrap: { alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm },
  ctaText: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 14 },
  drawnRow: { flexDirection: "row", gap: spacing.md, alignItems: "center" },
  thumb: {
    width: 64,
    height: 108,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.goldLine,
  },
  cardName: { color: colors.textPrimary, fontFamily: typography.h3.fontFamily, fontSize: 16 },
  cardMeaning: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 13, marginTop: 4, lineHeight: 18 },
  link: { color: colors.accent, fontFamily: typography.body.fontFamily, fontSize: 13, fontWeight: "600", marginTop: 6 },
});
