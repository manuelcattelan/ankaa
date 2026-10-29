import * as Match from "effect/Match";

import type { OtpCodeCompletenessValidationOutcome } from "#/features/authentication/core/validate-otp-code-completeness.ts";

import { OTP_CODE_LENGTH } from "#/features/authentication/constants/otp-code.ts";
import { validateOtpCodeScreenMessages } from "#/features/authentication/messages/validate-otp-code-screen-messages.ts";

export function getOtpCodeCompletenessValidationErrorMessage(
  otpCodeCompletenessValidationOutcome: OtpCodeCompletenessValidationOutcome,
) {
  return Match.valueTags(otpCodeCompletenessValidationOutcome, {
    OtpCodeCompletenessValid: () => undefined,
    OtpCodeIncomplete: () =>
      validateOtpCodeScreenMessages.otpCodeIncompleteError(OTP_CODE_LENGTH),
  });
}
