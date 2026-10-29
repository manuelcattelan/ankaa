export const SHARED_MESSAGES = {
  goHomeButton: "Go to home screen",
  homeScreenTitle: "Ankaa",
  notFoundScreenBody: "This screen doesn't exist.",
  notFoundScreenTitle: "Screen not found",
  serverUnreachableError:
    "Ankaa can't connect: check your internet connection and try again.",
  textFieldErrorLabel: ({
    errorMessage,
    label,
  }: {
    errorMessage: string;
    label: string;
  }) => `${label}, error: ${errorMessage}`,
  unknownError: "Something went wrong: try again.",
};
