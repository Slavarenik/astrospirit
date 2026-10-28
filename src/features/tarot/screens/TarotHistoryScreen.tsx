import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { ScreenBackground, OrnateFrame, GlassCard, FadeInUp } from "@shared/components";
import { colors, radius, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { useLocaleStore } from "@shared/storage/useLocaleStore";
import { useTarotHistoryStore, SpreadHistoryEntry } from "@shared/storage/useTarotHistoryStore";
import { CARD_IMAGES } from "../data/cardImages";
import { MyDayStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<MyDayStackParamList, "TarotHistory">;

const THUMB_W = 32;
const THUMB_H = Math.round(THUMB_W * 1.62);

function localeTag(locale: string): string {
  return locale === "ru" ? "ru-RU" : locale === "uk" ? "uk-UA" : "en-US";
}

function formatTimestamp(ts: number, locale: string): string {
  const d = new Date(ts);
  const tag = localeTag(locale);
  const datePart = d.toLocaleDateString(tag, { day: "numeric", month: "short", year: "numeric" });
  const timePart = d.toLocaleTimeString(tag, { hour: "2-digit", minute: "2-digit" });
  return `${datePart} · ${timePart}`;
}

function TrashIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M5 7h14M10 11v6M14 11v6M7 7l1-3h8l1 3M6 7l1 13h10l1-13" stroke={colors.textTertiary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function HistoryEntryCard({ entry, locale, onRemove }: { entry: SpreadHistoryEntry; locale: string; onRemove: () => void }) {
  return (
    <GlassCard sparkles style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.entryTitle}>{entry.spreadTitle}</Text>
          <Text style={styles.entryDate}>{formatTimestamp(entry.timestamp, locale)}</Text>
        </View>
        <Pressable onPress={onRemove} hitSlop={10} style={styles.removeBtn}>
          <TrashIcon />
        </Pressable>
      </View>

      {entry.context && <Text style={styles.entryContext}>"{entry.context}"</Text>}

      <View style={styles.cardsRow}>
        {entry.cards.map((c, i) => (
          <View key={i} style={styles.cardThumbWrap}>
            <Image
              source={CARD_IMAGES[c.cardId]}
              style={[styles.cardThumb, c.reversed ? { transform: [{ rotate: "180deg" }] } : null]}
              resizeMode="cover"
            />
            <Text style={styles.cardThumbLabel} numberOfLines={1}>
              {c.label}
            </Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

/** Stage 3 of the tarot-spreads plan: a plain list of every spread saved by
 *  useSpreadHistorySave, newest first — reached from its own card at the
 *  bottom of TarotSpreadIntroScreen, same as any other spread opens in its
 *  own screen. Read-only besides per-entry and clear-all removal; nothing
 *  here re-draws or edits a past reading. */
export function TarotHistoryScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const locale = useLocaleStore((s) => s.locale);
  const entries = useTarotHistoryStore((s) => s.entries);
  const removeEntry = useTarotHistoryStore((s) => s.removeEntry);
  const clear = useTarotHistoryStore((s) => s.clear);

  const handleClear = () => {
    Alert.alert(t("tarotSpreads.history.clearConfirm.title"), t("tarotSpreads.history.clearConfirm.body"), [
      { text: t("tarotSpreads.history.clearConfirm.cancel"), style: "cancel" },
      { text: t("tarotSpreads.history.clearConfirm.confirm"), style: "destructive", onPress: clear },
    ]);
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
        <Text style={styles.headerTitle}>{t("tarotSpreads.history.title")}</Text>
        {entries.length > 0 ? (
          <Pressable onPress={handleClear} hitSlop={10} style={styles.backBtn} accessibilityLabel={t("tarotSpreads.history.clear")}>
            <TrashIcon />
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{t("tarotSpreads.history.subtitle")}</Text>

        {entries.length === 0 ? (
          <Text style={styles.empty}>{t("tarotSpreads.history.empty")}</Text>
        ) : (
          entries.map((entry, i) => (
            <FadeInUp key={entry.id} delay={Math.min(i, 6) * 40}>
              <HistoryEntryCard entry={entry} locale={locale} onRemove={() => removeEntry(entry.id)} />
            </FadeInUp>
          ))
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backBtn: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: colors.gold, fontFamily: typography.h3.fontFamily, fontSize: 17, letterSpacing: 1.2 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.md },
  subtitle: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 14, lineHeight: 20, marginBottom: spacing.xs },
  empty: {
    color: colors.textTertiary,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.xxl,
    lineHeight: 20,
  },
  entryCard: { marginBottom: spacing.md },
  entryHeader: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  entryTitle: { color: colors.textPrimary, fontFamily: typography.h3.fontFamily, fontSize: 15.5 },
  entryDate: { color: colors.textTertiary, fontFamily: typography.caption.fontFamily, fontSize: typography.caption.fontSize, marginTop: 2 },
  removeBtn: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  entryContext: {
    color: colors.textSecondary,
    fontFamily: typography.body.fontFamily,
    fontStyle: "italic",
    fontSize: 13,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  cardsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.md },
  cardThumbWrap: { alignItems: "center", width: THUMB_W + 14, gap: 3 },
  cardThumb: { width: THUMB_W, height: THUMB_H, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.goldLine },
  cardThumbLabel: {
    color: colors.textTertiary,
    fontFamily: typography.label.fontFamily,
    fontSize: 7.5,
    letterSpacing: 0.2,
    textTransform: "uppercase",
    textAlign: "center",
  },
});
