import { useEffect } from "react";
import * as ReactNative from "react-native";

import { Text } from "#/shared/components/text.tsx";
import { useAnnounceMessage } from "#/shared/hooks/use-announce-message.ts";

/**
 * Shows a status and announces each one it shows, because `aria-live` works
 * only on Android (https://reactnative.dev/docs/accessibility#aria-live-android).
 */
export function StatusMessage({ message }: { message: null | string }) {
  const announceMessage = useAnnounceMessage();

  const hasMessage = message !== null && message !== "";

  useEffect(() => {
    if (hasMessage) {
      announceMessage(message);
    }
  }, [announceMessage, hasMessage, message]);

  return (
    <ReactNative.View accessible={hasMessage}>
      <Text selectable>{message}</Text>
    </ReactNative.View>
  );
}
