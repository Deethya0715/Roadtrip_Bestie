import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_PROMPT_KEY = "roadtrip_bestie.goldenHour.lastPromptYmd.v1";

export async function loadLastGoldenHourPromptYmd() {
  try {
    return await AsyncStorage.getItem(LAST_PROMPT_KEY);
  } catch {
    return null;
  }
}

export async function saveLastGoldenHourPromptYmd(ymd) {
  try {
    await AsyncStorage.setItem(LAST_PROMPT_KEY, ymd);
  } catch {
    /* non-fatal */
  }
}

export function localCalendarYmd() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
