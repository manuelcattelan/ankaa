import { useTheme } from "expo-router";
import * as ReactNative from "react-native";

import { TOUCH_TARGET_SIZE_MINIMUM } from "#/shared/constants/touch-target-size-minimum.ts";

type TextInputProperties = ReactNative.TextInputProps;

export function TextInput({ style, ...rest }: TextInputProperties) {
  const theme = useTheme();

  const themeStyle = {
    borderColor: theme.colors.border,
    color: theme.colors.text,
  };

  return (
    <ReactNative.TextInput
      {...rest}
      style={[styles.input, themeStyle, style]}
    />
  );
}

const styles = ReactNative.StyleSheet.create({
  input: {
    borderWidth: ReactNative.StyleSheet.hairlineWidth,
    minHeight: TOUCH_TARGET_SIZE_MINIMUM,
  },
});
