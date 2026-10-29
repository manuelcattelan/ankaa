import * as ReactNative from "react-native";

import { Text } from "#/shared/components/text.tsx";

export function StatusMessage({ message }: { message: null | string }) {
  const hasMessage = message !== null && message !== "";

  return (
    <ReactNative.View accessible={hasMessage} aria-live="polite">
      <Text selectable>{message}</Text>
    </ReactNative.View>
  );
}
