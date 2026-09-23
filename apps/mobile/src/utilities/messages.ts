import { formatCount, formatFieldLabel } from "@/utilities/format";

type CodeSentValues = {
  codeLength: number;
  email: string;
};

const EMAIL_LABEL = "Email";
const VERIFICATION_CODE_LABEL = "Verification code";
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
    codeExpired: "That code has expired. Request a new code.",
    emailNotShared:
      "That account did not share an email address. Try another sign-in method.",
    generic: "Something went wrong. Try again.",
    invalidCode: "That code is not correct. Check the code and try again.",
    invalidEmail: "Enter a valid email address, for example name@example.com.",
    network: "Could not reach the server. Check your connection and try again.",
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
  verifyOtp: {
    codeAccessibilityLabel: (errorMessage?: string) =>
      formatFieldLabel({ errorMessage, label: VERIFICATION_CODE_LABEL }),
    codeLabel: "Code",
    codeSent: ({ codeLength, email }: CodeSentValues) =>
      `We sent a ${codeLength}-digit code to ${email}.`,
    enterCode: (codeLength: number) => `Enter the ${codeLength}-digit code.`,
    needsNewCode: "Too many attempts. Request a new code to continue.",
    resend: "Resend code",
    resendAvailableIn: (seconds: number) =>
      `Resend available in ${formatCount({ count: seconds, ...SECONDS_UNIT })}`,
    resendHint: (seconds: number) =>
      `Available ${formatCount({ count: seconds, ...SECONDS_UNIT })} after a code is sent`,
    resendReady: "You can request a new code now.",
    title: "Enter OTP code",
    verify: "Verify",
  },
  withEmail: {
    continue: "Continue",
    emailAccessibilityLabel: (errorMessage?: string) =>
      formatFieldLabel({ errorMessage, label: EMAIL_LABEL }),
    emailLabel: EMAIL_LABEL,
    title: "Continue with email",
  },
};
