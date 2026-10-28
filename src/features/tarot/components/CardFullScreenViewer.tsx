import React from "react";
import { Modal, View, Text, Image, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@shared/theme";
import { TarotCard } from "../data/tarotCatalog";
import { CARD_IMAGES } from "../data/cardImages";

type Props = {
  card: TarotCard | null;
  reversed: boolean;
  label: string;
  onClose: () => void;
};

/** Full-screen enlargement for an already-revealed spread card. A slot that's
 *  already face-up does nothing useful on a second tap otherwise, so this
 *  turns that repeat tap into a closer look instead: the card fills most of
 *  the screen, its position label (Past, Outcome, …) sits where a header
 *  would be, and tapping anywhere dismisses it back to the spread. One
 *  shared component so every spread screen gets the same behavior. */
export function CardFullScreenViewer({ card, reversed, label, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const maxW = width - spacing.xl * 2;
  const maxH = height - insets.top - insets.bottom - 180;
  const cardW = Math.min(maxW, maxH / 1.62);
  const cardH = cardW * 1.62;

  return (
    <Modal visible={!!card} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={{ height: insets.top + spacing.xxl }} />
        <Text style={styles.label}>{label}</Text>
        {card && (
          <>
            <Image
              source={CARD_IMAGES[card.id]}
              style={[
                styles.image,
                { width: cardW, height: cardH, transform: reversed ? [{ rotate: "180deg" }] : undefined },
              ]}
              resizeMode="cover"
            />
            <Text style={styles.cardName}>{card.name}</Text>
          </>
        )}
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(10,8,4,0.95)",
    alignItems: "center",
  },
  label: {
    color: colors.gold,
    fontFamily: typography.label.fontFamily,
    fontSize: 14,
    letterSpacing: typography.label.letterSpacing,
    textTransform: "uppercase",
    marginBottom: spacing.lg,
  },
  image: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.goldLine,
  },
  cardName: {
    color: colors.textPrimary,
    fontFamily: typography.h3.fontFamily,
    fontSize: 18,
    marginTop: spacing.lg,
  },
});
