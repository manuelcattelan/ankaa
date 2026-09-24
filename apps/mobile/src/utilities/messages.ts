import { formatCount } from "@/utilities/format";

type FieldLabelValues = {
  errorMessage: string;
  label: string;
};

type OtpCodeSentValues = {
  email: string;
  otpCodeLength: number;
};

const SECONDS_UNIT = { plural: "seconds", singular: "second" };

export const messages = {
  app: {
    signedInAs: (email?: string) => `Signed in as ${email ?? ""}`,
    signOut: "Sign out",
    title: "Ankaa",
  },
  error: {
    accountNotConnected:
      "We couldn't connect that account. Sign in with email instead.",
    emailNotShared:
      "That account did not share an email address. Try another sign-in method.",
    fieldLabel: ({ errorMessage, label }: FieldLabelValues) =>
      `${label}, error: ${errorMessage}`,
    generic: "Something went wrong. Try again.",
    invalidEmail: "Enter a valid email address, for example name@example.com.",
    invalidOtpCode: "That code is not correct. Check the code and try again.",
    network: "Could not reach the server. Check your connection and try again.",
    otpCodeExpired: "That code has expired. Request a new code.",
    playServicesMissing:
      "Google Play services are required to sign in with Google.",
    rateLimited: (seconds: number) =>
      `Too many requests. Try again in ${formatCount({ count: seconds, ...SECONDS_UNIT })}.`,
    rateLimitedShortly: "Too many requests. Try again in a moment.",
    server: "We're having trouble on our end. Try again in a moment.",
    tooManyAttempts:
      "Too many incorrect attempts. Request a new code to continue.",
  },
  notFound: {
    body: "This screen doesn't exist.",
    goHome: "Go to home",
    title: "Not found",
  },
  root: {
    errorBoundary: "Oops! Something went wrong.",
  },
  signIn: {
    title: "Sign in",
  },
  verifyOtpCode: {
    enterOtpCode: (otpCodeLength: number) =>
      `Enter the ${otpCodeLength}-digit code.`,
    needsNewOtpCode: "Too many attempts. Request a new code to continue.",
    otpCodeLabel: "Verification code",
    otpCodeSent: ({ email, otpCodeLength }: OtpCodeSentValues) =>
      `We sent a ${otpCodeLength}-digit code to ${email}.`,
    resend: "Resend code",
    resendAvailableIn: (seconds: number) =>
      `Resend available in ${formatCount({ count: seconds, ...SECONDS_UNIT })}`,
    resendHint: "Sends a new code to your email address.",
    resendReady: "You can request a new code now.",
    title: "Enter OTP code",
    verify: "Verify",
  },
  withEmail: {
    continue: "Continue",
    emailLabel: "Email",
    title: "Continue with email",
  },
};
