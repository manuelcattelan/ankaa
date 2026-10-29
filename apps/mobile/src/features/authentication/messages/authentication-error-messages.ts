import { formatCount } from "#/shared/core/format-count.ts";

export const authenticationErrorMessages = {
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
    `Too many requests: try again in ${formatCount({ count: seconds, plural: "seconds", singular: "second" })}.`,
  requestsRateLimitedWithoutDelay: "Too many requests: try again in a moment.",
};
