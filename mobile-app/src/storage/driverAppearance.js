import AsyncStorage from "@react-native-async-storage/async-storage";

const DRIVER_DARK_KEY = "roadtrip_bestie.driver.darkMode.v1";

export async function loadDriverDarkMode() {
  try {
    const v = await AsyncStorage.getItem(DRIVER_DARK_KEY);
    return v === "1";
  } catch {
    return false;
  }
}

export async function saveDriverDarkMode(enabled) {
  try {
    await AsyncStorage.setItem(DRIVER_DARK_KEY, enabled ? "1" : "0");
  } catch {
    /* non-fatal */
  }
}
