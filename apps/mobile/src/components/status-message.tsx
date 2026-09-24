import * as ReactNative from "react-native";

import { Text } from "@/components/text";

type StatusMessageProperties = {
  message?: string;
};

export function StatusMessage({ message }: StatusMessageProperties) {
  return (
    <ReactNative.View accessible={!!message} aria-live="polite">
      <Text selectable>{message}</Text>
    </ReactNative.View>
  );
}
