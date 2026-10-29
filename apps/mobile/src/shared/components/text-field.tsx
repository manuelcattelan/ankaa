import type { TextInputProps } from "react-native";

import { TextInput } from "#/shared/components/text-input.tsx";
import { Text } from "#/shared/components/text.tsx";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

export function TextField({
  errorMessage,
  label,
  ...rest
}: Pick<
  TextInputProps,
  | "autoCapitalize"
  | "autoComplete"
  | "autoCorrect"
  | "autoFocus"
  | "enterKeyHint"
  | "inputMode"
  | "maxLength"
  | "multiline"
  | "onChangeText"
  | "onSubmitEditing"
  | "value"
> & {
  errorMessage: null | string;
  label: string;
}) {
  const hasErrorMessage = errorMessage !== null && errorMessage !== "";
  const accessibilityLabel = hasErrorMessage
    ? SHARED_MESSAGES.textFieldErrorLabel({ errorMessage, label })
    : label;

  return (
    <>
      <Text aria-hidden>{label}</Text>
      <TextInput {...rest} aria-label={accessibilityLabel} />
      {hasErrorMessage ? <Text>{errorMessage}</Text> : null}
    </>
  );
}
