import type { TextInputProps } from "react-native";

import { StatusMessage } from "@/shared/components/status-message";
import { Text } from "@/shared/components/text";
import { TextInput } from "@/shared/components/text-input";
import { textFieldMessages } from "@/shared/messages/text-field-messages";

type TextFieldProperties = TextInputProps & {
  errorMessage?: string;
  label: string;
};

export function TextField({
  errorMessage,
  label,
  ...rest
}: TextFieldProperties) {
  const accessibilityLabel = errorMessage
    ? textFieldMessages.errorLabel({ errorMessage, label })
    : label;

  return (
    <>
      <Text aria-hidden>{label}</Text>
      <TextInput {...rest} aria-label={accessibilityLabel} />
      <StatusMessage message={errorMessage} />
    </>
  );
}
