import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { ZodiacSign } from "@shared/theme";

/** Local, on-device scheduled notifications — no push server, no APNs/FCM
 *  credentials needed. Two kinds: a daily "come read your horoscope"
 *  nudge, and a weekly week-ahead summary. Both use Expo's calendar
 *  trigger (repeats at a fixed hour/minute, optionally a fixed weekday),
 *  so once scheduled they keep firing without the app doing anything. */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const DAILY_ID = "astrospirit-daily-horoscope";
const WEEKLY_ID = "astrospirit-weekly-summary";
const CHANNEL_ID = "default";

export type NotificationPermission = "granted" | "denied" | "undetermined";

export async function getNotificationPermission(): Promise<NotificationPermission> {
  const { status } = await Notifications.getPermissionsAsync();
  return status as NotificationPermission;
}

/** Ensures the Android notification channel exists, then requests (or
 *  reads existing) permission. Safe to call repeatedly. */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Astro Spirit",
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: "#C7A55E",
    });
  }
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === "granted") return "granted";
  const { status } = await Notifications.requestPermissionsAsync();
  return status as NotificationPermission;
}

export type DailyScheduleSettings = { enabled: boolean; hour: number; minute: number };
export type WeeklyScheduleSettings = {
  enabled: boolean;
  weekday: number; // 1=Sunday .. 7=Saturday
  hour: number;
  minute: number;
};

export type NotificationCopy = {
  dailyTitle: string;
  dailyBody: string;
  weeklyTitle: string;
  weeklyBody: string;
};

/** Cancels and reschedules both notifications to match the given settings.
 *  Call this once at app start and again whenever the user changes a
 *  setting — cheap, and it keeps what's actually scheduled on the device
 *  from drifting out of sync with the stored preferences (e.g. after an
 *  app update, or the user changing locale/sign, which changes the copy). */
export async function syncScheduledNotifications(
  daily: DailyScheduleSettings,
  weekly: WeeklyScheduleSettings,
  copy: NotificationCopy
): Promise<void> {
  await Promise.all([
    Notifications.cancelScheduledNotificationAsync(DAILY_ID).catch(() => {}),
    Notifications.cancelScheduledNotificationAsync(WEEKLY_ID).catch(() => {}),
  ]);

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") return;

  if (daily.enabled) {
    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_ID,
      content: { title: copy.dailyTitle, body: copy.dailyBody },
      trigger: {
        hour: daily.hour,
        minute: daily.minute,
        repeats: true,
        channelId: Platform.OS === "android" ? CHANNEL_ID : undefined,
      },
    });
  }

  if (weekly.enabled) {
    await Notifications.scheduleNotificationAsync({
      identifier: WEEKLY_ID,
      content: { title: copy.weeklyTitle, body: copy.weeklyBody },
      trigger: {
        weekday: weekly.weekday,
        hour: weekly.hour,
        minute: weekly.minute,
        repeats: true,
        channelId: Platform.OS === "android" ? CHANNEL_ID : undefined,
      },
    });
  }
}

/** Fills the {{sign}} placeholder in the translated notification copy. */
export function fillNotificationCopy(
  template: NotificationCopy,
  sign: ZodiacSign,
  signLabel: string
): NotificationCopy {
  const fill = (s: string) => s.replace("{{sign}}", signLabel);
  return {
    dailyTitle: template.dailyTitle,
    dailyBody: fill(template.dailyBody),
    weeklyTitle: template.weeklyTitle,
    weeklyBody: fill(template.weeklyBody),
  };
}
