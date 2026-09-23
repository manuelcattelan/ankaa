import * as ReactNative from "react-native";

type KeyboardAvoidingViewProperties = ReactNative.KeyboardAvoidingViewProps;

export function KeyboardAvoidingView({
  style,
  ...rest
}: KeyboardAvoidingViewProperties) {
  return (
    <ReactNative.KeyboardAvoidingView
      behavior={ReactNative.Platform.OS === "android" ? "padding" : undefined}
      {...rest}
      style={[styles.container, style]}
    />
  );
}

const styles = ReactNative.StyleSheet.create({
  container: { flex: 1 },
});
