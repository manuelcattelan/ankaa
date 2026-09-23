import type { PressableProps } from "react-native";

import { useTheme } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  busy?: boolean;
  title: string;
};

export function Button({
  busy = false,
  disabled,
  title,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      {...rest}
      accessibilityLabel={title}
      aria-busy={busy}
      disabled={disabled}
      role="button"
      style={[styles.button, disabled && styles.disabled]}
    >
      {busy ? (
        <ActivityIndicator />
      ) : (
        <Text style={{ color: colors.primary }}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 48 },
  disabled: { opacity: 0.4 },
});
