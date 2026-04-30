import { useEffect, useRef, useCallback } from "react";
import { Alert, AppState, Platform } from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { getNextMagicHourStart } from "./sunsetApi";
import {
  loadLastGoldenHourPromptYmd,
  saveLastGoldenHourPromptYmd,
  localCalendarYmd,
} from "./storage";
import {
  requestNotificationPermissionsIfNeeded,
  scheduleGoldenHourNotification,
  cancelScheduledGoldenHourNotifications,
} from "./goldenHourNotifications";
import { LA_LA_LAND_SUNSET_THEME } from "../../themes/manifestoThemes";

/**
 * Live GPS → sunset API → local notification 15 min before sunset + in-app prompt.
 * Accepting switches to La La Land · Sunset with a cinematic fade (via callback).
 */
export function useGoldenHourTracker({
  isConfirmed,
  vibeMode,
  activeTheme,
  switchToMagicHourTheme,
}) {
  const scheduleRef = useRef({ magicHourStart: 0, sunsetMs: 0 });
  const lastPromptYmdRef = useRef(null);
  const promptOpenRef = useRef(false);

  useEffect(() => {
    if (Platform.OS === "web") return;
    loadLastGoldenHourPromptYmd().then((y) => {
      lastPromptYmdRef.current = y;
    });
  }, []);

  const maybePrompt = useCallback(() => {
    if (!isConfirmed || !LA_LA_LAND_SUNSET_THEME) return;
    if (promptOpenRef.current) return;

    const { magicHourStart, sunsetMs } = scheduleRef.current;
    const now = Date.now();
    if (!magicHourStart || !sunsetMs || now < magicHourStart || now > sunsetMs) {
      return;
    }

    const ymd = localCalendarYmd();
    if (lastPromptYmdRef.current === ymd) return;

    if (vibeMode === "manifesto" && activeTheme?.id === "la-la-land-sunset") {
      lastPromptYmdRef.current = ymd;
      saveLastGoldenHourPromptYmd(ymd);
      return;
    }

    promptOpenRef.current = true;
    Alert.alert(
      "Magic Hour",
      "Magic Hour is approaching. Switching to La La Land Sunset theme?",
      [
        {
          text: "Not now",
          style: "cancel",
          onPress: () => {
            lastPromptYmdRef.current = ymd;
            saveLastGoldenHourPromptYmd(ymd);
            promptOpenRef.current = false;
          },
        },
        {
          text: "Switch",
          onPress: () => {
            lastPromptYmdRef.current = ymd;
            saveLastGoldenHourPromptYmd(ymd);
            promptOpenRef.current = false;
            switchToMagicHourTheme?.();
          },
        },
      ]
    );
  }, [isConfirmed, vibeMode, activeTheme, switchToMagicHourTheme]);

  const refreshScheduleFromGps = useCallback(async () => {
    if (Platform.OS === "web" || !LA_LA_LAND_SUNSET_THEME) return;
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") return;

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const next = await getNextMagicHourStart(
      pos.coords.latitude,
      pos.coords.longitude
    );
    scheduleRef.current = {
      magicHourStart: next.magicHourStart,
      sunsetMs: next.sunsetMs,
    };
    await scheduleGoldenHourNotification(next.magicHourStart);
  }, []);

  useEffect(() => {
    if (Platform.OS === "web" || !LA_LA_LAND_SUNSET_THEME) return;

    if (!isConfirmed) {
      cancelScheduledGoldenHourNotifications();
      return;
    }

    let cancelled = false;
    let pollIv = null;
    let refreshIv = null;

    (async () => {
      await requestNotificationPermissionsIfNeeded();
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled || status !== "granted") return;
      try {
        await refreshScheduleFromGps();
      } catch (e) {
        console.warn("Golden hour: initial schedule failed:", e.message);
      }
    })();

    pollIv = setInterval(maybePrompt, 30_000);
    refreshIv = setInterval(() => {
      if (!cancelled) {
        refreshScheduleFromGps().catch((e) =>
          console.warn("Golden hour: refresh failed:", e.message)
        );
      }
    }, 15 * 60 * 1000);

    const appSub = AppState.addEventListener("change", (s) => {
      if (s === "active") {
        refreshScheduleFromGps().catch(() => {});
        setTimeout(maybePrompt, 800);
      }
    });

    return () => {
      cancelled = true;
      if (pollIv) clearInterval(pollIv);
      if (refreshIv) clearInterval(refreshIv);
      appSub.remove();
    };
  }, [isConfirmed, maybePrompt, refreshScheduleFromGps]);

  useEffect(() => {
    if (Platform.OS === "web" || !isConfirmed || !LA_LA_LAND_SUNSET_THEME) return;

    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        if (
          response.notification.request.content.data?.type === "golden_hour"
        ) {
          setTimeout(maybePrompt, 400);
        }
      }
    );

    Notifications.getLastNotificationResponseAsync().then((res) => {
      if (
        res?.notification.request.content.data?.type === "golden_hour" &&
        isConfirmed
      ) {
        setTimeout(maybePrompt, 600);
      }
    });

    return () => sub.remove();
  }, [isConfirmed, maybePrompt]);
}
