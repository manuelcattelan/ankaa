import { formatCount } from "@/shared/core/format-count";

export const validateOtpCodeScreenMessages = {
  otpCodeIncompleteError: (otpCodeLength: number) =>
    `This verification code is incomplete: enter all ${formatCount({ count: otpCodeLength, plural: "digits", singular: "digit" })}.`,
  otpCodeLabel: "Verification code",
  resendOtpCodeButton: "Resend verification code",
  resendOtpCodeCooldownStatus: (seconds: number) =>
    `You can resend the verification code in ${formatCount({ count: seconds, plural: "seconds", singular: "second" })}.`,
  resendOtpCodeHint: "Sends a new verification code to your email address.",
  resendOtpCodeReadyAnnouncement: "You can resend the verification code.",
  title: "Enter verification code",
  validateOtpCodeButton: "Sign in",
  validateOtpCodeReadyAnnouncement: "You can try to sign in again.",
};
