import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "roadtrip_bestie.tripPlan.v1";

/**
 * Shape:
 * {
 *   origin: string,
 *   destination: string,
 *   stops: Array<{ id: string, label: string }>
 * }
 */

export async function loadTripPlan() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn("loadTripPlan failed:", err.message);
    return null;
  }
}

export async function saveTripPlan(plan) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(plan));
  } catch (err) {
    console.warn("saveTripPlan failed:", err.message);
  }
}

export async function clearTripPlan() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (err) {
    console.warn("clearTripPlan failed:", err.message);
  }
}
