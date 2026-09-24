import { useTheme } from "expo-router";
import * as ReactNative from "react-native";

import { Text } from "@/components/text";
import { MINIMUM_TOUCH_TARGET_SIZE } from "@/utilities/constants";

type ButtonProperties = Omit<
  ReactNative.PressableProps,
  "children" | "style"
> & {
  isBusy?: boolean;
  title: string;
};

const DISABLED_OPACITY = 0.4;

export function Button({
  disabled,
  isBusy = false,
  title,
  ...rest
}: ButtonProperties) {
  const theme = useTheme();

  const titleStyle = { color: theme.colors.primary };

  return (
    <ReactNative.Pressable
      role="button"
      {...rest}
      aria-busy={isBusy}
      aria-label={title}
      disabled={disabled}
      style={[styles.button, disabled ? styles.disabled : undefined]}
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
