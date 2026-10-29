import { useTheme } from "expo-router";
import * as ReactNative from "react-native";

import { Text } from "#/shared/components/text.tsx";
import { MINIMUM_TOUCH_TARGET_SIZE } from "#/shared/constants/minimum-touch-target-size.ts";

type ButtonProps = Omit<ReactNative.PressableProps, "children" | "style"> & {
  isBusy?: boolean;
  style?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  title: string;
};

const DISABLED_OPACITY = 0.4;

export function Button({
  disabled,
  isBusy = false,
  style,
  title,
  ...rest
}: ButtonProps) {
  const theme = useTheme();

  const titleStyle = { color: theme.colors.primary };

  return (
    <ReactNative.Pressable
      role="button"
      {...rest}
      aria-busy={isBusy}
      aria-label={title}
      disabled={disabled}
      style={[styles.button, disabled ? styles.disabled : null, style]}
    >
      {isBusy ? (
        <ReactNative.ActivityIndicator />
      ) : (
        <Text style={titleStyle}>{title}</Text>
      )}
    </ReactNative.Pressable>
  );
}

const styles = ReactNative.StyleSheet.create({
  button: { minHeight: MINIMUM_TOUCH_TARGET_SIZE },
  disabled: { opacity: DISABLED_OPACITY },
});
