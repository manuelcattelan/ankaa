import type { TextInputProps } from "react-native";

import { StatusMessage } from "@/components/status-message";
import { Text } from "@/components/text";
import { TextInput } from "@/components/text-input";
import { messages } from "@/utilities/messages";

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
    ? messages.error.fieldLabel({ errorMessage, label })
    : label;

  return (
    <>
      <Text aria-hidden>{label}</Text>
      <TextInput {...rest} aria-label={accessibilityLabel} />
      <StatusMessage message={errorMessage} />
    </>
  );
}
