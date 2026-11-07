import * as ReactNative from "react-native";

import { MINIMUM_TOUCH_TARGET_SIZE } from "#/shared/constants/minimum-touch-target-size.ts";
import { color } from "#/shared/tokens/color.ts";

type TextInputProps = ReactNative.TextInputProps;

export function TextInput({ style, ...rest }: TextInputProps) {
  return <ReactNative.TextInput {...rest} style={[styles.input, style]} />;
}

const styles = ReactNative.StyleSheet.create({
  input: {
    borderColor: color.border,
    borderWidth: ReactNative.StyleSheet.hairlineWidth,
    color: color.foreground,
    minHeight: MINIMUM_TOUCH_TARGET_SIZE,
  },
});
