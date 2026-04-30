import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const CHANNEL_ID = "golden-hour";

export async function ensureGoldenHourNotificationChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Golden Hour",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#818cf8",
  });
}

export async function requestNotificationPermissionsIfNeeded() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function cancelScheduledGoldenHourNotifications() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((r) => r.content?.data?.type === "golden_hour")
      .map((r) => Notifications.cancelScheduledNotificationAsync(r.identifier))
  );
}

/**
 * @param {number} magicHourStartMs
 */
export async function scheduleGoldenHourNotification(magicHourStartMs) {
  await cancelScheduledGoldenHourNotifications();
  await ensureGoldenHourNotificationChannel();

  const when = new Date(magicHourStartMs);
  if (when.getTime() <= Date.now() + 10_000) {
    return null;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Magic Hour",
      body: "Magic Hour is approaching. Switching to La La Land Sunset theme?",
      data: { type: "golden_hour" },
      ...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: when,
    },
  });
  return id;
}
