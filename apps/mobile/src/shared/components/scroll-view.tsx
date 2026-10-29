import type { KeyboardAwareScrollViewProps } from "react-native-keyboard-controller";

import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type ScrollViewProps = KeyboardAwareScrollViewProps;

export function ScrollView({ children, ...rest }: ScrollViewProps) {
  return (
    <KeyboardAwareScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      {...rest}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
