import * as ReactNative from "react-native";

type ScrollViewProperties = ReactNative.ScrollViewProps;

export function ScrollView({ children, ...rest }: ScrollViewProperties) {
  return (
    <ReactNative.ScrollView
      automaticallyAdjustKeyboardInsets
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      {...rest}
    >
      {children}
    </ReactNative.ScrollView>
  );
}
