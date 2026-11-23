import type { KeyboardAwareScrollViewProps } from "react-native-keyboard-controller";

import { StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { spacing } from "#/shared/tokens/spacing.ts";

type ScrollViewProps = KeyboardAwareScrollViewProps;

export function ScrollView({ children, ...rest }: ScrollViewProps) {
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      {...rest}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}

// The Screen margins go on top of the insets that automatic adjustment
// reserves for the bars, which alone let content touch them (DESIGN.md).
const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.horizontalScreenMargin,
    paddingVertical: spacing.verticalScreenMargin,
  },
});
