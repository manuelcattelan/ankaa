import { useTheme } from "expo-router";
import * as ReactNative from "react-native";

type TextProperties = ReactNative.TextProps;

export function Text({ style, ...rest }: TextProperties) {
  const theme = useTheme();

  const themeStyle = { color: theme.colors.text };

  return <ReactNative.Text {...rest} style={[themeStyle, style]} />;
}
