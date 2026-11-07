import * as ReactNative from "react-native";

import { borders } from "#/shared/tokens/borders.ts";
import { color } from "#/shared/tokens/color.ts";
import { sizing } from "#/shared/tokens/sizing.ts";

type TextInputProps = ReactNative.TextInputProps;

export function TextInput({ style, ...rest }: TextInputProps) {
  return <ReactNative.TextInput {...rest} style={[styles.input, style]} />;
}

const styles = ReactNative.StyleSheet.create({
  input: {
    borderColor: color.border,
    borderWidth: borders.width,
    color: color.foreground,
    minHeight: sizing.minimumHitTarget,
  },
});
