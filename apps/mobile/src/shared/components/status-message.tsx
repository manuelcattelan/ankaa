import * as ReactNative from "react-native";

import { Text } from "#/shared/components/text.tsx";

type StatusMessageProps = {
  message: null | string;
};

export function StatusMessage({ message }: StatusMessageProps) {
  return (
    <ReactNative.View accessible={!!message} aria-live="polite">
      <Text selectable>{message}</Text>
    </ReactNative.View>
  );
}
