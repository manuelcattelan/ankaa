import { formatCount } from "@/utilities/format";

type FieldLabelValues = {
  errorMessage: string;
  label: string;
};

const SECONDS_UNIT = { plural: "seconds", singular: "second" };

export const messages = {
  app: {
    signOut: "Sign out",
    title: "Ankaa",
  },
  error: {
    accountNotConnected:
      "We couldn't link the account for the selected provider: try another sign-in method.",
    emailNotShared:
      "We couldn't access the account's email address for the selected provider: try another sign-in method.",
    fieldLabel: ({ errorMessage, label }: FieldLabelValues) =>
      `${label}, error: ${errorMessage}`,
    generic: "Something went wrong: try again.",
    invalidEmail:
      "The provided email address is invalid: provide a valid email address.",
    invalidOtpCode:
      "The provided OTP code is invalid: check the OTP code you received via email and try again.",
    network:
      "We couldn't reach our server: check your connection and try again.",
    otpCodeExpired:
      "The provided OTP code has expired: request a new OTP code and try again.",
    playServicesMissing:
      "Google Play services aren't installed on this device: try another sign-in method.",
    rateLimited: (seconds: number) =>
      `Too many requests: try again in ${formatCount({ count: seconds, ...SECONDS_UNIT })}.`,
    rateLimitedShortly: "Too many requests: try again in a moment.",
    tooManyAttempts:
      "Too many incorrect attempts: request a new OTP code and try again.",
  },
  notFound: {
    body: "This screen doesn't exist.",
    goHome: "Back to home",
    title: "Screen not found",
  },
  signIn: {
    title: "Sign in",
  },
  validateOtpCode: {
    enterOtpCode: (otpCodeLength: number) =>
      `The provided OTP code is invalid: provide a valid ${otpCodeLength}-digit OTP code.`,
    otpCodeLabel: "OTP code",
    resend: "Request a new OTP code",
    resendAvailableIn: (seconds: number) =>
      `You can request a new OTP code in ${formatCount({ count: seconds, ...SECONDS_UNIT })}.`,
    resendHint: "Request a new OTP code.",
    resendReady: "You can request a new OTP code.",
    title: "Enter OTP code",
    validate: "Validate OTP code",
    validateReady: "You can validate the OTP code.",
  },
  withEmail: {
    emailLabel: "Email address",
    title: "Continue with email address",
  },
};
