import type { TextInputProps } from "react-native";

import { StatusMessage } from "#/shared/components/status-message.tsx";
import { TextInput } from "#/shared/components/text-input.tsx";
import { Text } from "#/shared/components/text.tsx";
import { TEXT_FIELD_MESSAGES } from "#/shared/messages/text-field-messages.ts";

export function TextField({
  errorMessage,
  label,
  ...rest
}: TextInputProps & {
  errorMessage: null | string;
  label: string;
}) {
  const accessibilityLabel =
    errorMessage === null || errorMessage === ""
      ? label
      : TEXT_FIELD_MESSAGES.errorLabel({ errorMessage, label });

  return (
    <>
      <Text aria-hidden>{label}</Text>
      <TextInput {...rest} aria-label={accessibilityLabel} />
      <StatusMessage message={errorMessage} />
    </>
  );
}
