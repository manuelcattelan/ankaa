import { useEffect } from "react";
import * as ReactNative from "react-native";

import { Text } from "#/shared/components/text.tsx";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { announceMessage } from "#/shared/interactors/announce-message.ts";

/**
 * Shows a status and announces each one it shows, because `aria-live` works
 * only on Android (https://reactnative.dev/docs/accessibility#aria-live-android).
 */
export function StatusMessage({ message }: { message: null | string }) {
  const runtime = useRuntime();

  const hasMessage = message !== null && message !== "";

  useEffect(() => {
    if (message !== null) {
      runtime.runSync(announceMessage(message));
    }
  }, [message, runtime]);

  return (
    <ReactNative.View accessible={hasMessage}>
      <Text selectable>{message}</Text>
    </ReactNative.View>
  );
}
