type TextFieldErrorLabelOptions = {
  errorMessage: string;
  label: string;
};

export const TEXT_FIELD_MESSAGES = {
  errorLabel: ({ errorMessage, label }: TextFieldErrorLabelOptions) =>
    `${label}, error: ${errorMessage}`,
};
