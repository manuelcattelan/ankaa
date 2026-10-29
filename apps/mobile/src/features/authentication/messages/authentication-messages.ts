import { formatCount } from "#/shared/core/format-count.ts";

export const AUTHENTICATION_MESSAGES = {
  accountNotLinkedError:
    "This account can't be linked with the selected provider: try another sign-in method.",
  continueWithEmailButton: "Continue with email address",
  emailInvalidError:
    "This email address isn't valid: enter an address like name@example.com.",
  emailLabel: "Email address",
  emailNotSharedError:
    "The selected provider didn't share your email address: try another sign-in method.",
  otpCodeAttemptsExceededError:
    "Too many incorrect attempts: resend the verification code and try again.",
  otpCodeExpiredError:
    "This verification code has expired: resend the verification code and try again.",
  otpCodeIncompleteError: (otpCodeLength: number) =>
    `This verification code is incomplete: enter all ${formatCount({ count: otpCodeLength, plural: "digits", singular: "digit" })}.`,
  otpCodeInvalidError:
    "This verification code is incorrect: check the verification code in your email and try again.",
  otpCodeLabel: "Verification code",
  playServicesMissingError:
    "Google Play services aren't installed on this device: try another sign-in method.",
  requestsRateLimitedError: (seconds: number) =>
    `Too many requests: try again in ${formatCount({ count: seconds, plural: "seconds", singular: "second" })}.`,
  requestsRateLimitedWithoutDelayError:
    "Too many requests: try again in a moment.",
  resendOtpCodeButton: "Resend verification code",
  resendOtpCodeHint: "Sends a new verification code to your email address.",
  sendOtpCodeButton: "Continue with email address",
  signInScreenTitle: "Sign in",
  signOutButton: "Sign out",
  validateOtpCodeButton: "Sign in",
  validateOtpCodeScreenTitle: "Enter verification code",
  withEmailScreenTitle: "Continue with email address",
};
