import { formatCount } from "@/utilities/format";

type TextFieldErrorLabelOptions = {
  errorMessage: string;
  label: string;
};

const SECONDS_UNIT = { plural: "seconds", singular: "second" };

export const messages = {
  app: {
    signOutButton: "Sign out",
    title: "Ankaa",
  },
  error: {
    accountNotConnected:
      "This account can't be linked with the selected provider: try another sign-in method.",
    emailInvalid:
      "This email address isn't valid: enter an address like name@example.com.",
    emailNotShared:
      "The selected provider didn't share your email address: try another sign-in method.",
    otpCodeAttemptsExceeded:
      "Too many incorrect attempts: resend the verification code and try again.",
    otpCodeExpired:
      "This verification code has expired: resend the verification code and try again.",
    otpCodeInvalid:
      "This verification code is incorrect: check the verification code in your email and try again.",
    playServicesMissing:
      "Google Play services aren't installed on this device: try another sign-in method.",
    requestsRateLimited: (seconds: number) =>
      `Too many requests: try again in ${formatCount({ count: seconds, ...SECONDS_UNIT })}.`,
    requestsRateLimitedWithoutDelay:
      "Too many requests: try again in a moment.",
    serverUnreachable:
      "The server can't be reached: check your connection and try again.",
    unknown: "Something went wrong: try again.",
  },
  exercisePicker: {
    barbellEquipmentLabel: "Barbell",
    benchEquipmentLabel: "Bench",
    chestMuscleGroupLabel: "Chest",
    equipmentFilterLabel: "Equipment you have",
    exerciseListEmptyStatus: "No exercises match your filters.",
    exerciseNameFilterLabel: "Exercise name",
    frontDeltoidMuscleGroupLabel: "Front deltoid",
    muscleGroupFilterLabel: "Muscle groups",
    rackEquipmentLabel: "Rack",
    tricepsMuscleGroupLabel: "Triceps",
  },
  notFound: {
    body: "This screen doesn't exist.",
    goHomeButton: "Go to home screen",
    title: "Screen not found",
  },
  signIn: {
    continueWithEmailButton: "Continue with email address",
    title: "Sign in",
  },
  textField: {
    errorLabel: ({ errorMessage, label }: TextFieldErrorLabelOptions) =>
      `${label}, error: ${errorMessage}`,
  },
  validateOtpCode: {
    otpCodeLabel: "Verification code",
    otpCodeLengthError: (otpCodeLength: number) =>
      `This verification code is incomplete: enter all ${formatCount({ count: otpCodeLength, plural: "digits", singular: "digit" })}.`,
    resendOtpCodeButton: "Resend verification code",
    resendOtpCodeCooldownStatus: (seconds: number) =>
      `You can resend the verification code in ${formatCount({ count: seconds, ...SECONDS_UNIT })}.`,
    resendOtpCodeHint: "Sends a new verification code to your email address.",
    resendOtpCodeReadyAnnouncement: "You can resend the verification code.",
    title: "Enter verification code",
    validateOtpCodeButton: "Sign in",
    validateOtpCodeReadyAnnouncement: "You can try to sign in again.",
  },
  withEmail: {
    emailLabel: "Email address",
    sendOtpCodeButton: "Continue with email address",
    title: "Continue with email address",
  },
};
