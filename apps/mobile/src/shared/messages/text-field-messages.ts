export const TEXT_FIELD_MESSAGES = {
  errorLabel: ({
    errorMessage,
    label,
  }: {
    errorMessage: string;
    label: string;
  }) => `${label}, error: ${errorMessage}`,
};
