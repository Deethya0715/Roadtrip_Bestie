import AsyncStorage from "@react-native-async-storage/async-storage";

const CONTACTS_KEY = "roadtrip_bestie.safeCheckIn.contacts.v1";
const SETTINGS_KEY = "roadtrip_bestie.safeCheckIn.settings.v1";
const NEXT_VIBE_KEY = "roadtrip_bestie.safeCheckIn.nextVibeAt.v1";

/**
 * Emergency contacts are plain strings (names or phone/handles) used to
 * personalise the copied "I'm safe" message. We don't send SMS — the
 * share sheet copies the message and the user pastes it into the group
 * chat that includes these people.
 */
export async function loadContacts() {
  try {
    const raw = await AsyncStorage.getItem(CONTACTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveContacts(contacts) {
  try {
    await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts ?? []));
  } catch (err) {
    console.warn("saveContacts failed:", err.message);
  }
}

const DEFAULT_SETTINGS = {
  // Pause the automation (e.g. the group is on break at a hotel).
  enabled: true,
  // Forces Blackout Mode on regardless of clock. Default off.
  forceBlackout: false,
  // Whether the client should actually watch GPS. Off by default so the
  // app doesn't prompt for permission until the user opts in.
  locationEnabled: false,
};

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ ...DEFAULT_SETTINGS, ...settings })
    );
  } catch (err) {
    console.warn("saveSettings failed:", err.message);
  }
}

/**
 * The next-Vibe-Check target timestamp is persisted so the 30-minute
 * cadence survives cold starts, backgrounding, and being force-quit.
 * The timer is never reset by app lifecycle — only by actually reaching
 * the target, at which point we roll it forward by one interval.
 */
export async function loadNextVibeAt() {
  try {
    const raw = await AsyncStorage.getItem(NEXT_VIBE_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function saveNextVibeAt(timestamp) {
  try {
    if (timestamp == null) {
      await AsyncStorage.removeItem(NEXT_VIBE_KEY);
    } else {
      await AsyncStorage.setItem(NEXT_VIBE_KEY, String(timestamp));
    }
  } catch (err) {
    console.warn("saveNextVibeAt failed:", err.message);
  }
}

export { DEFAULT_SETTINGS };
