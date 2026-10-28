import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GlowButton, FadeInUp } from "@shared/components";
import { colors, radius, spacing, typography } from "@shared/theme";
import { translateTexts, useLocaleStore, useT, useTranslatedTexts } from "@shared/i18n";
import { generateMeditationScript } from "@shared/utils/aiContent";
import { SanctuaryStackParamList } from "@app/navigation/types";

const SUGGESTIONS = [
  "I can't sleep because of thoughts about work",
  "I need a 5-minute reset after an argument",
  "I'm anxious about tomorrow",
];

export function AudioGeneratorInput() {
  const t = useT();
  const navigation = useNavigation<NativeStackNavigationProp<SanctuaryStackParamList>>();
  const locale = useLocaleStore((s) => s.locale);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const { texts: suggestionLabels } = useTranslatedTexts(SUGGESTIONS);

  const handleGenerate = async (prompt: string) => {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    try {
      const script = generateMeditationScript(prompt, 5);
      const lines = await translateTexts(script.lines, locale);
      navigation.navigate("Player", {
        generatedTitle: script.title,
        lines,
        durationMinutes: script.durationMinutes,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <FadeInUp style={styles.host}>
      <View style={styles.wrap}>
        <Text style={styles.eyebrow}>{t("sanctuary.ai.eyebrow")}</Text>
        <Text style={styles.title}>{t("sanctuary.ai.title")}</Text>

        {/* Invisible mirror text sizes the box — no fixed height */}
        <View style={styles.inputBox}>
          <Text style={[styles.inputText, styles.inputMirror]}>
            {text.length > 0 ? text : t("sanctuary.ai.placeholder")}
          </Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t("sanctuary.ai.placeholder")}
            placeholderTextColor={colors.textTertiary}
            style={[styles.inputText, styles.inputField]}
            multiline
            textAlignVertical="top"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestScroll}
          contentContainerStyle={styles.suggestRow}
        >
          {SUGGESTIONS.map((s, i) => (
            <Text key={s} style={styles.suggestChip} onPress={() => handleGenerate(s)}>
              {suggestionLabels[i] ?? s}
            </Text>
          ))}
        </ScrollView>

        <GlowButton
          title={t("sanctuary.ai.generate")}
          onPress={() => handleGenerate(text)}
          disabled={text.trim().length < 3 || busy}
          loading={busy}
        />
      </View>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  host: {
    flexGrow: 0,
    alignSelf: "stretch",
  },
  wrap: {
    flexGrow: 0,
    alignSelf: "stretch",
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
    backgroundColor: colors.bg2,
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.accent,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: typography.h2.fontFamily,
    fontSize: 20,
  },


  inputBox: {
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
    backgroundColor: colors.bg3,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    minHeight: 112,
  },

  inputText: {
    color: colors.textPrimary,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
  },
  inputMirror: {
    opacity: 0,
    minHeight: 92,
  },
  inputField: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    margin: 0,
  },

  suggestScroll: {
    flexGrow: 0,
  },
  suggestRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
    gap: spacing.xs,
  },

  suggestChip: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 15,
    fontFamily: typography.caption.fontFamily,
    backgroundColor: colors.bg3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    overflow: "hidden",
    flexShrink: 0,
  },
});
