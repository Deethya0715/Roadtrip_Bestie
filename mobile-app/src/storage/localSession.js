import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "roadtrip_bestie.localSession.v1";

/**
 * Persist the user's role + name locally so we can restore their
 * session after an app reload.
 *
 * @param {{role: "driver" | "passenger", name: string}} payload
 */
export async function saveLocalSession(payload) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn("saveLocalSession failed:", err.message);
  }
}

export async function loadLocalSession() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.role || !parsed?.name) return null;
    return parsed;
  } catch (err) {
    console.warn("loadLocalSession failed:", err.message);
    return null;
  }
}

export async function clearLocalSession() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (err) {
    console.warn("clearLocalSession failed:", err.message);
  }
}
