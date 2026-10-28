import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { ScreenBackground, OrnateFrame, GlassCard, GlowButton, FadeInUp } from "@shared/components";
import { colors, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { CardBack } from "../components/CardBack";
import { MyDayStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<MyDayStackParamList, "TarotSpreadIntro">;

const MINI_W = 30;
const MINI_H = Math.round(MINI_W * 1.62);

function ThreeCardMiniPreview() {
  return (
    <View style={styles.threeMiniRow}>
      <CardBack width={MINI_W} height={MINI_H} />
      <CardBack width={MINI_W} height={MINI_H} />
      <CardBack width={MINI_W} height={MINI_H} />
    </View>
  );
}

// Tiny previews for the five spreads added after Celtic Cross — each one
// mirrors that spread's own screen layout (same nesting, just shrunk and
// with tighter gaps), so the icon reads as a miniature of the real shape
// rather than a generic "N cards" placeholder.
const TINY_W = 9;
const TINY_H = Math.round(TINY_W * 1.62);

function Tiny() {
  return <CardBack width={TINY_W} height={TINY_H} />;
}

// Yes/No is just the one card — shown a little larger since there's
// nothing else in the shape to give it scale.
const SOLO_W = 18;
const SOLO_H = Math.round(SOLO_W * 1.62);

function YesNoMiniIcon() {
  return (
    <View style={styles.miniIconBox}>
      <CardBack width={SOLO_W} height={SOLO_H} />
    </View>
  );
}

// Diamond: issue on top, helps/hinders as the side arms, outcome on the
// bottom — same shape as CrossSpreadScreen's own layout.
function CrossMiniIcon() {
  return (
    <View style={[styles.miniIconBox, styles.miniStack]}>
      <Tiny />
      <View style={styles.miniRow}>
        <Tiny />
        <Tiny />
      </View>
      <Tiny />
    </View>
  );
}

// Situation card on top, then path A / path B as two 2-card columns below
// — same shape as ChoiceSpreadScreen.
function ChoiceMiniIcon() {
  return (
    <View style={[styles.miniIconBox, styles.miniStack]}>
      <Tiny />
      <View style={styles.miniRow}>
        <View style={styles.miniCol}>
          <Tiny />
          <Tiny />
        </View>
        <View style={styles.miniCol}>
          <Tiny />
          <Tiny />
        </View>
      </View>
    </View>
  );
}

// Seven cards in a row with a small vertical offset per column, highest in
// the middle — the same upward arc HorseshoeScreen lays its cards in.
const ARC_OFFSETS = [8, 5, 2, 0, 2, 5, 8];

function HorseshoeMiniIcon() {
  return (
    <View style={[styles.miniIconBox, styles.miniArcRow]}>
      {ARC_OFFSETS.map((offset, i) => (
        <View key={i} style={{ marginTop: offset }}>
          <Tiny />
        </View>
      ))}
    </View>
  );
}

// Two facing 3-card columns (each partner's thoughts/feelings/behavior)
// with a shared outcome card below — same shape as StationForTwoScreen.
function StationForTwoMiniIcon() {
  return (
    <View style={[styles.miniIconBox, styles.miniStack]}>
      <View style={styles.miniRow}>
        <View style={styles.miniCol}>
          <Tiny />
          <Tiny />
          <Tiny />
        </View>
        <View style={styles.miniCol}>
          <Tiny />
          <Tiny />
          <Tiny />
        </View>
      </View>
      <Tiny />
    </View>
  );
}

// Same shape as CelticCrossScreen itself: the 4-arm cross (with the
// present/challenge pair crossed in the center cell) beside the 4-card
// staff column.
function CelticCrossMiniIcon() {
  return (
    <View style={[styles.miniIconBox, styles.miniRow]}>
      <View style={styles.miniCrossStack}>
        <View style={styles.miniCrossRow}>
          <View style={styles.miniSpacer} />
          <Tiny />
          <View style={styles.miniSpacer} />
        </View>
        <View style={styles.miniCrossRow}>
          <Tiny />
          <View style={styles.miniCenterCell}>
            <Tiny />
            <View style={styles.miniChallengeOverlay}>
              <Tiny />
            </View>
          </View>
          <Tiny />
        </View>
        <View style={styles.miniCrossRow}>
          <View style={styles.miniSpacer} />
          <Tiny />
          <View style={styles.miniSpacer} />
        </View>
      </View>
      <View style={styles.miniCol}>
        <Tiny />
        <Tiny />
        <Tiny />
        <Tiny />
      </View>
    </View>
  );
}

// A small fanned stack of face-down cards standing in for "your past
// spreads" — distinct from the shape-accurate icons above since History
// isn't a spread shape itself, just a pile of old ones.
const STACK_W = 22;
const STACK_H = Math.round(STACK_W * 1.62);

function HistoryMiniIcon() {
  return (
    <View style={styles.historyIconBox}>
      <View style={[styles.historyCard, { left: 0, transform: [{ rotate: "-10deg" }] }]}>
        <CardBack width={STACK_W} height={STACK_H} />
      </View>
      <View style={[styles.historyCard, { left: 10, transform: [{ rotate: "4deg" }] }]}>
        <CardBack width={STACK_W} height={STACK_H} />
      </View>
      <View style={[styles.historyCard, { left: 20 }]}>
        <CardBack width={STACK_W} height={STACK_H} />
      </View>
    </View>
  );
}

/** A picker between the available spreads (Stage 1's 3-card spread, Stage
 *  2's Celtic Cross) — a real screen, not a modal, so tapping the Tarot
 *  Spreads card on My Day lands here first rather than jumping straight
 *  into a draw. Each option is its own card with a small preview and its
 *  own "Begin" button; adding a Stage 3 spread later is just another card
 *  in this list. */
export function TarotSpreadIntroScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();

  return (
    <ScreenBackground variant="night">
      <OrnateFrame />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 5l-7 7 7 7" stroke={colors.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>{t("tarotSpreads.widgetTitle")}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <FadeInUp>
          <GlassCard sparkles style={styles.spreadCard}>
            <View style={styles.spreadRow}>
              <ThreeCardMiniPreview />
              <View style={{ flex: 1 }}>
                <Text style={styles.spreadTitle}>{t("tarotSpreads.threeCard.title")}</Text>
                <Text style={styles.spreadSubtitle}>{t("tarotSpreads.threeCard.subtitle")}</Text>
              </View>
            </View>
            <GlowButton
              title={t("tarotSpreads.start")}
              variant="outline"
              onPress={() => navigation.navigate("TarotSpread", { context: undefined })}
              style={{ marginTop: spacing.md }}
            />
          </GlassCard>
        </FadeInUp>

        <FadeInUp delay={120}>
          <GlassCard sparkles style={styles.spreadCard}>
            <View style={styles.spreadRow}>
              <CelticCrossMiniIcon />
              <View style={{ flex: 1 }}>
                <Text style={styles.spreadTitle}>{t("tarotSpreads.celticCross.title")}</Text>
                <Text style={styles.spreadSubtitle}>{t("tarotSpreads.celticCross.subtitle")}</Text>
              </View>
            </View>
            <GlowButton
              title={t("tarotSpreads.start")}
              variant="outline"
              onPress={() => navigation.navigate("CelticCross", { context: undefined })}
              style={{ marginTop: spacing.md }}
            />
          </GlassCard>
        </FadeInUp>

        <FadeInUp delay={180}>
          <GlassCard sparkles style={styles.spreadCard}>
            <View style={styles.spreadRow}>
              <YesNoMiniIcon />
              <View style={{ flex: 1 }}>
                <Text style={styles.spreadTitle}>{t("tarotSpreads.yesNo.title")}</Text>
                <Text style={styles.spreadSubtitle}>{t("tarotSpreads.yesNo.subtitle")}</Text>
              </View>
            </View>
            <GlowButton
              title={t("tarotSpreads.start")}
              variant="outline"
              onPress={() => navigation.navigate("YesNoSpread", { context: undefined })}
              style={{ marginTop: spacing.md }}
            />
          </GlassCard>
        </FadeInUp>

        <FadeInUp delay={240}>
          <GlassCard sparkles style={styles.spreadCard}>
            <View style={styles.spreadRow}>
              <CrossMiniIcon />
              <View style={{ flex: 1 }}>
                <Text style={styles.spreadTitle}>{t("tarotSpreads.cross.title")}</Text>
                <Text style={styles.spreadSubtitle}>{t("tarotSpreads.cross.subtitle")}</Text>
              </View>
            </View>
            <GlowButton
              title={t("tarotSpreads.start")}
              variant="outline"
              onPress={() => navigation.navigate("CrossSpread", { context: undefined })}
              style={{ marginTop: spacing.md }}
            />
          </GlassCard>
        </FadeInUp>

        <FadeInUp delay={300}>
          <GlassCard sparkles style={styles.spreadCard}>
            <View style={styles.spreadRow}>
              <ChoiceMiniIcon />
              <View style={{ flex: 1 }}>
                <Text style={styles.spreadTitle}>{t("tarotSpreads.choice.title")}</Text>
                <Text style={styles.spreadSubtitle}>{t("tarotSpreads.choice.subtitle")}</Text>
              </View>
            </View>
            <GlowButton
              title={t("tarotSpreads.start")}
              variant="outline"
              onPress={() => navigation.navigate("ChoiceSpread", { context: undefined })}
              style={{ marginTop: spacing.md }}
            />
          </GlassCard>
        </FadeInUp>

        <FadeInUp delay={360}>
          <GlassCard sparkles style={styles.spreadCard}>
            <View style={styles.spreadRow}>
              <HorseshoeMiniIcon />
              <View style={{ flex: 1 }}>
                <Text style={styles.spreadTitle}>{t("tarotSpreads.horseshoe.title")}</Text>
                <Text style={styles.spreadSubtitle}>{t("tarotSpreads.horseshoe.subtitle")}</Text>
              </View>
            </View>
            <GlowButton
              title={t("tarotSpreads.start")}
              variant="outline"
              onPress={() => navigation.navigate("Horseshoe", { context: undefined })}
              style={{ marginTop: spacing.md }}
            />
          </GlassCard>
        </FadeInUp>

        <FadeInUp delay={420}>
          <GlassCard sparkles style={styles.spreadCard}>
            <View style={styles.spreadRow}>
              <StationForTwoMiniIcon />
              <View style={{ flex: 1 }}>
                <Text style={styles.spreadTitle}>{t("tarotSpreads.stationForTwo.title")}</Text>
                <Text style={styles.spreadSubtitle}>{t("tarotSpreads.stationForTwo.subtitle")}</Text>
              </View>
            </View>
            <GlowButton
              title={t("tarotSpreads.start")}
              variant="outline"
              onPress={() => navigation.navigate("StationForTwo", { context: undefined })}
              style={{ marginTop: spacing.md }}
            />
          </GlassCard>
        </FadeInUp>

        <FadeInUp delay={480}>
          <GlassCard sparkles style={styles.spreadCard}>
            <View style={styles.spreadRow}>
              <HistoryMiniIcon />
              <View style={{ flex: 1 }}>
                <Text style={styles.spreadTitle}>{t("tarotSpreads.history.title")}</Text>
                <Text style={styles.spreadSubtitle}>{t("tarotSpreads.history.subtitle")}</Text>
              </View>
            </View>
            <GlowButton
              title={t("tarotSpreads.history.open")}
              variant="outline"
              onPress={() => navigation.navigate("TarotHistory")}
              style={{ marginTop: spacing.md }}
            />
          </GlassCard>
        </FadeInUp>
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
  backBtn: { width: 34, height: 34, justifyContent: "center" },
  headerTitle: { color: colors.gold, fontFamily: typography.h3.fontFamily, fontSize: 17, letterSpacing: 1.2 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.md },
  spreadCard: { marginBottom: spacing.md },
  spreadRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  threeMiniRow: { flexDirection: "row", gap: 4 },
  miniIconBox: { alignItems: "center", justifyContent: "center" },
  miniStack: { gap: 3 },
  miniRow: { flexDirection: "row", gap: 6 },
  miniCol: { gap: 2 },
  miniArcRow: { flexDirection: "row", alignItems: "flex-start", gap: 2 },
  miniCrossStack: { gap: 2 },
  miniCrossRow: { flexDirection: "row", alignItems: "flex-start", gap: 2 },
  miniSpacer: { width: TINY_W },
  miniCenterCell: { width: TINY_W, height: TINY_H, alignItems: "center", justifyContent: "center" },
  miniChallengeOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: TINY_W,
    height: TINY_H,
    transform: [{ rotate: "90deg" }],
    zIndex: 2,
  },
  historyIconBox: { width: 50, height: STACK_H + 8 },
  historyCard: { position: "absolute", top: 4 },
  spreadTitle: { color: colors.textPrimary, fontFamily: typography.h3.fontFamily, fontSize: 16 },
  spreadSubtitle: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 12.5, marginTop: 3, lineHeight: 17 },
});
