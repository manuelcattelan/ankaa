import type { KeyboardAwareScrollViewProps } from "react-native-keyboard-controller";

import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type ScrollViewProperties = KeyboardAwareScrollViewProps;

export function ScrollView({ children, ...rest }: ScrollViewProperties) {
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
