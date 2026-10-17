import * as Match from "effect/Match";

import type { OtpCodeLengthValidationOutcome } from "@/features/authentication/core/validate-otp-code-length";

import { OTP_CODE_LENGTH } from "@/features/authentication/constants/otp-code";
import { validateOtpCodeScreenMessages } from "@/features/authentication/messages/validate-otp-code-screen-messages";

export function getOtpCodeLengthValidationErrorMessage(
  otpCodeLengthValidationOutcome: OtpCodeLengthValidationOutcome,
) {
  return Match.valueTags(otpCodeLengthValidationOutcome, {
    OtpCodeLength: () =>
      validateOtpCodeScreenMessages.otpCodeLengthError(OTP_CODE_LENGTH),
    OtpCodeLengthValid: () => undefined,
  });
}
