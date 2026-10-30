import { useTheme } from "expo-router";
import * as ReactNative from "react-native";

type TextProps = ReactNative.TextProps;

export function Text({ style, ...rest }: TextProps) {
  const theme = useTheme();

  const themeStyle = { color: theme.colors.text };

  return <ReactNative.Text {...rest} style={[themeStyle, style]} />;
}
