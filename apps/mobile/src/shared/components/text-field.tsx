import type { TextInputProps } from "react-native";

import { StatusMessage } from "#/shared/components/status-message.tsx";
import { TextInput } from "#/shared/components/text-input.tsx";
import { Text } from "#/shared/components/text.tsx";
import { TEXT_FIELD_MESSAGES } from "#/shared/messages/text-field-messages.ts";

type TextFieldProps = TextInputProps & {
  errorMessage: null | string;
  label: string;
};

export function TextField({ errorMessage, label, ...rest }: TextFieldProps) {
  const accessibilityLabel = errorMessage
    ? TEXT_FIELD_MESSAGES.errorLabel({ errorMessage, label })
    : label;

  return (
    <>
      <Text aria-hidden>{label}</Text>
      <TextInput {...rest} aria-label={accessibilityLabel} />
      <StatusMessage message={errorMessage} />
    </>
  );
}
