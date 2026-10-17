type TextFieldErrorLabelOptions = {
  errorMessage: string;
  label: string;
};

export const textFieldMessages = {
  errorLabel: ({ errorMessage, label }: TextFieldErrorLabelOptions) =>
    `${label}, error: ${errorMessage}`,
};
