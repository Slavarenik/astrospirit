import { useEffect } from "react";
import { useNotificationsStore } from "@shared/storage/useNotificationsStore";
import { useUserStore } from "@shared/storage/useUserStore";
import { useLocaleStore } from "@shared/storage/useLocaleStore";
import { useT } from "@shared/i18n";
import { getZodiacSign } from "@shared/utils/astrology";
import { syncScheduledNotifications, fillNotificationCopy } from "./notifications";

/** Keeps the device's scheduled notifications in sync with
 *  useNotificationsStore + the user's sign/locale. Call this once, high up
 *  (App.tsx), after stores have hydrated — not only from the settings
 *  screen, so the schedule stays correct (right sign, right language) even
 *  if the user never reopens that screen after the first setup. */
export function useSyncNotifications() {
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  const daily = useNotificationsStore((s) => ({ enabled: s.dailyEnabled, hour: s.dailyHour, minute: s.dailyMinute }));
  const weekly = useNotificationsStore((s) => ({
    enabled: s.weeklyEnabled,
    weekday: s.weeklyWeekday,
    hour: s.weeklyHour,
    minute: s.weeklyMinute,
  }));
  const hasHydrated = useNotificationsStore((s) => s.hasHydrated);
  const profile = useUserStore((s) => s.profile);
  const sign = profile?.sunSign ?? getZodiacSign(6, 15);

  useEffect(() => {
    if (!hasHydrated) return;
    const signLabel = t(`signs.${sign}`);
    const copy = fillNotificationCopy(
      {
        dailyTitle: t("notifications.notifBody.dailyTitle"),
        dailyBody: t("notifications.notifBody.dailyBody"),
        weeklyTitle: t("notifications.notifBody.weeklyTitle"),
        weeklyBody: t("notifications.notifBody.weeklyBody"),
      },
      sign,
      signLabel
    );
    syncScheduledNotifications(daily, weekly, copy).catch(() => {});
    // `t` is intentionally left out of deps — it's a brand new closure every
    // render; `locale` is the actual signal that its output would change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasHydrated,
    sign,
    locale,
    daily.enabled,
    daily.hour,
    daily.minute,
    weekly.enabled,
    weekly.weekday,
    weekly.hour,
    weekly.minute,
  ]);
}
