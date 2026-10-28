import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Switch, Platform, Linking } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { GlassCard, SectionHeader } from "@shared/components";
import { colors, radius, spacing, typography } from "@shared/theme";
import { useT } from "@shared/i18n";
import { useNotificationsStore } from "@shared/storage/useNotificationsStore";
import { requestNotificationPermission } from "@shared/notifications/notifications";

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
/** Expo/iOS calendar-trigger weekday convention: 1 = Sunday .. 7 = Saturday. */
const WEEKDAY_NUMBERS = [1, 2, 3, 4, 5, 6, 7];

function timeToDate(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

function TimeRow({
  label,
  hour,
  minute,
  onChange,
}: {
  label: string;
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginTop: spacing.xs }}>
      <Pressable style={styles.timeRow} onPress={() => setOpen((s) => !s)}>
        <Text style={styles.timeLabel}>{label}</Text>
        <Text style={styles.timeValue}>{format(timeToDate(hour, minute), "h:mm a")}</Text>
      </Pressable>
      {open && (
        <DateTimePicker
          value={timeToDate(hour, minute)}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, selected) => {
            if (Platform.OS === "android") setOpen(false);
            if (selected) onChange(selected.getHours(), selected.getMinutes());
          }}
          themeVariant="dark"
          textColor={colors.textPrimary}
          style={{ alignSelf: "stretch", marginTop: spacing.xs }}
        />
      )}
    </View>
  );
}

/** Daily "come read your horoscope" reminder + weekly week-ahead summary —
 *  both local scheduled notifications (see shared/notifications). Toggling
 *  either on requests OS notification permission the first time. */
export function NotificationSettingsCard() {
  const t = useT();
  const daily = useNotificationsStore((s) => ({ enabled: s.dailyEnabled, hour: s.dailyHour, minute: s.dailyMinute }));
  const weekly = useNotificationsStore((s) => ({
    enabled: s.weeklyEnabled,
    weekday: s.weeklyWeekday,
    hour: s.weeklyHour,
    minute: s.weeklyMinute,
  }));
  const permission = useNotificationsStore((s) => s.permission);
  const setDaily = useNotificationsStore((s) => s.setDaily);
  const setWeekly = useNotificationsStore((s) => s.setWeekly);
  const setPermission = useNotificationsStore((s) => s.setPermission);

  const ensurePermission = async (): Promise<boolean> => {
    const result = await requestNotificationPermission();
    setPermission(result);
    return result === "granted";
  };

  const handleDailyToggle = async (value: boolean) => {
    if (value && permission !== "granted") {
      const granted = await ensurePermission();
      if (!granted) return;
    }
    setDaily({ dailyEnabled: value });
  };

  const handleWeeklyToggle = async (value: boolean) => {
    if (value && permission !== "granted") {
      const granted = await ensurePermission();
      if (!granted) return;
    }
    setWeekly({ weeklyEnabled: value });
  };

  return (
    <GlassCard sparkles>
      <SectionHeader title={t("notifications.title")} />

      {permission === "denied" && (
        <Pressable
          style={styles.deniedBanner}
          onPress={() => (Platform.OS === "ios" ? Linking.openURL("app-settings:") : Linking.openSettings())}
        >
          <Text style={styles.deniedText}>{t("notifications.permissionDenied")}</Text>
          <Text style={styles.deniedLink}>{t("notifications.openSettings")}</Text>
        </Pressable>
      )}

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>{t("notifications.dailyTitle")}</Text>
          <Text style={styles.rowSubtitle}>{t("notifications.dailySubtitle")}</Text>
        </View>
        <Switch
          value={daily.enabled}
          onValueChange={handleDailyToggle}
          trackColor={{ false: colors.bg3, true: colors.goldDeep }}
          thumbColor={daily.enabled ? colors.gold : colors.textTertiary}
        />
      </View>
      {daily.enabled && (
        <TimeRow
          label={t("notifications.time")}
          hour={daily.hour}
          minute={daily.minute}
          onChange={(hour, minute) => setDaily({ dailyHour: hour, dailyMinute: minute })}
        />
      )}

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>{t("notifications.weeklyTitle")}</Text>
          <Text style={styles.rowSubtitle}>{t("notifications.weeklySubtitle")}</Text>
        </View>
        <Switch
          value={weekly.enabled}
          onValueChange={handleWeeklyToggle}
          trackColor={{ false: colors.bg3, true: colors.goldDeep }}
          thumbColor={weekly.enabled ? colors.gold : colors.textTertiary}
        />
      </View>
      {weekly.enabled && (
        <>
          <View style={styles.weekdayRow}>
            {WEEKDAY_KEYS.map((key, i) => {
              const num = WEEKDAY_NUMBERS[i];
              const active = num === weekly.weekday;
              return (
                <Pressable
                  key={key}
                  onPress={() => setWeekly({ weeklyWeekday: num })}
                  style={[styles.weekdayChip, active && styles.weekdayChipActive]}
                >
                  <Text style={[styles.weekdayText, active && styles.weekdayTextActive]}>
                    {t(`notifications.weekdays.${key}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <TimeRow
            label={t("notifications.time")}
            hour={weekly.hour}
            minute={weekly.minute}
            onChange={(hour, minute) => setWeekly({ weeklyHour: hour, weeklyMinute: minute })}
          />
        </>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs },
  rowTitle: { color: colors.textPrimary, fontFamily: typography.h3.fontFamily, fontSize: 15 },
  rowSubtitle: { color: colors.textTertiary, fontFamily: typography.body.fontFamily, fontSize: 12.5, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.hairline, marginVertical: spacing.md },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.bg3,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  timeLabel: {
    color: colors.textTertiary,
    fontFamily: typography.label.fontFamily,
    fontSize: typography.micro.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
  timeValue: { color: colors.gold, fontFamily: typography.bodyLg.fontFamily, fontSize: 14.5, fontWeight: "600" },
  weekdayRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm },
  weekdayChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.goldLineHairline,
  },
  weekdayChipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  weekdayText: { color: colors.textTertiary, fontSize: 11, fontFamily: typography.caption.fontFamily },
  weekdayTextActive: { color: colors.textOnAccent, fontWeight: "700" },
  deniedBanner: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  deniedText: { color: colors.textSecondary, fontSize: 12.5, fontFamily: typography.body.fontFamily },
  deniedLink: { color: colors.gold, fontSize: 12.5, fontFamily: typography.label.fontFamily, marginTop: 2 },
});
