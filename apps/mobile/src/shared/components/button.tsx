import * as ReactNative from "react-native";

import { Text } from "#/shared/components/text.tsx";
import { color } from "#/shared/tokens/color.ts";
import { opacity } from "#/shared/tokens/opacity.ts";
import { sizing } from "#/shared/tokens/sizing.ts";

export function Button({
  disabled,
  isBusy = false,
  style,
  title,
  ...rest
}: Omit<ReactNative.PressableProps, "children" | "style"> & {
  isBusy?: boolean;
  style?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  title: string;
}) {
  return (
    <ReactNative.Pressable
      role="button"
      {...rest}
      aria-busy={isBusy}
      aria-label={title}
      disabled={disabled}
      style={[styles.button, disabled === true ? styles.disabled : null, style]}
    >
      {isBusy ? (
        <ReactNative.ActivityIndicator />
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
    </ReactNative.Pressable>
  );
}

const styles = ReactNative.StyleSheet.create({
  button: { minHeight: sizing.minimumHitTarget },
  disabled: { opacity: opacity.disabled },
  title: { color: color.accentForeground },
});
