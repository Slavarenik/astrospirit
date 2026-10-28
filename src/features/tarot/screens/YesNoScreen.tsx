import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useT } from "@shared/i18n";
import { colors, spacing, typography } from "@shared/theme";
import { SpreadSlot } from "../components/SpreadSlot";
import { CardFullScreenViewer } from "../components/CardFullScreenViewer";
import { SpreadScreenLayout, SpreadResultEntry } from "../components/SpreadScreenLayout";
import { useSpreadDraw } from "../hooks/useSpreadDraw";
import { useSpreadHistorySave } from "../hooks/useSpreadHistorySave";
import { MyDayStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<MyDayStackParamList, "YesNoSpread">;

const SLOT_W = 110;
const SLOT_H = Math.round(SLOT_W * 1.62);

/** A single-card spread: the simplest, fastest reading on offer. Upright
 *  leans yes, reversed leans no — the card's own meaning text underneath
 *  gives the "why", so the verdict isn't just a coin flip. */
export function YesNoScreen({ navigation, route }: Props) {
  const t = useT();
  const [context, setContext] = useState(route.params?.context ?? "");
  const { slots, allRevealed, handleSlotPress, handleNewSpread, viewerIndex, closeViewer } = useSpreadDraw(1);
  const slot = slots[0];
  const isYes = slot.card ? !slot.reversed : null;

  const results: SpreadResultEntry[] = slot.card
    ? [{ key: slot.card.id, label: t("tarotSpreads.yesNo.title"), card: slot.card, reversed: slot.reversed }]
    : [];

  useSpreadHistorySave(
    t("tarotSpreads.yesNo.title"),
    slots,
    [isYes === null ? t("tarotSpreads.yesNo.title") : isYes ? t("tarotSpreads.yesNo.yes") : t("tarotSpreads.yesNo.no")],
    allRevealed,
    context
  );

  return (
    <>
      <SpreadScreenLayout
        title={t("tarotSpreads.yesNo.title")}
        subtitle={t("tarotSpreads.yesNo.subtitle")}
        placeholder={t("tarotSpreads.yesNo.placeholder")}
        context={context}
        onContextChange={setContext}
        allRevealed={allRevealed}
        onBack={() => navigation.goBack()}
        results={results}
        onNewSpread={handleNewSpread}
      >
        <View style={styles.center}>
          <SpreadSlot width={SLOT_W} height={SLOT_H} card={slot.card} reversed={slot.reversed} onPress={() => handleSlotPress(0)} />
          {allRevealed && (
            <Text style={[styles.verdict, isYes ? styles.verdictYes : styles.verdictNo]}>
              {isYes ? t("tarotSpreads.yesNo.yes") : t("tarotSpreads.yesNo.no")}
            </Text>
          )}
        </View>
      </SpreadScreenLayout>
      <CardFullScreenViewer
        card={viewerIndex !== null ? slots[viewerIndex].card : null}
        reversed={viewerIndex !== null ? slots[viewerIndex].reversed : false}
        label={t("tarotSpreads.yesNo.title")}
        onClose={closeViewer}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", marginTop: spacing.md },
  verdict: {
    fontFamily: typography.h3.fontFamily,
    fontSize: 28,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: spacing.lg,
  },
  verdictYes: { color: colors.gold },
  verdictNo: { color: colors.textSecondary },
});
