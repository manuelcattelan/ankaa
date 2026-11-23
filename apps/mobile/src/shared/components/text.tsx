import * as ReactNative from "react-native";

import { color } from "#/shared/tokens/color.ts";

type TextProps = ReactNative.TextProps;

export function Text({ style, ...rest }: TextProps) {
  return <ReactNative.Text {...rest} style={[styles.text, style]} />;
}

const styles = ReactNative.StyleSheet.create({
  text: { color: color.foreground },
});
