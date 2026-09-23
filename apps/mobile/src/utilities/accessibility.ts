import { AccessibilityInfo, Platform } from "react-native";

export function announceMessage(message: string) {
  if (!message || Platform.OS !== "ios") {
    return;
  }

  AccessibilityInfo.announceForAccessibilityWithOptions(message, {
    queue: true,
  });
}
