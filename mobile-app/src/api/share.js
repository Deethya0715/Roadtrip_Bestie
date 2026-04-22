import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import { Alert, Platform } from "react-native";

/**
 * Open the OS-level share sheet with a plain-text message, or fall back
 * to copying the message to the clipboard when native sharing is
 * unavailable (e.g. web, simulator with no share targets).
 *
 * `expo-sharing` wants a file URI, so for text-only content we route
 * everything through the clipboard with a user-visible confirmation.
 * That keeps the UX identical across iOS, Android, and web without
 * needing Twilio or an SMS provider.
 *
 * @param {string} message   The text to share (invite link, game code, etc.)
 * @param {string} [title]   Optional title shown in the confirmation alert.
 */
export async function shareMessage(message, title = "Roadtrip Bestie") {
  if (!message) return;

  try {
    await Clipboard.setStringAsync(message);

    const canShareFiles = await Sharing.isAvailableAsync();

    Alert.alert(
      title,
      canShareFiles
        ? "Copied to clipboard! Paste it into your group chat."
        : `Copied to clipboard on ${Platform.OS}. Paste it anywhere to share.`,
      [{ text: "OK" }]
    );
  } catch (err) {
    console.warn("shareMessage failed", err);
    Alert.alert("Couldn't share", "Please try again.");
  }
}

/**
 * Share a locally generated file (e.g. a screenshot of the leaderboard).
 * Accepts a `file://` URI produced by expo-file-system or expo-media-library.
 *
 * @param {string} fileUri
 */
export async function shareFile(fileUri) {
  if (!fileUri) return;

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    Alert.alert("Sharing unavailable", "This device can't open the share sheet.");
    return;
  }

  await Sharing.shareAsync(fileUri);
}
