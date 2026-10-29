import * as Match from "effect/Match";

import type { OtpCodeCompletenessValidationOutcome } from "#/features/authentication/core/validate-otp-code-completeness.ts";

import { OTP_CODE_LENGTH } from "#/features/authentication/constants/otp-code-length.ts";
import { VALIDATE_OTP_CODE_SCREEN_MESSAGES } from "#/features/authentication/messages/validate-otp-code-screen-messages.ts";

export function getOtpCodeCompletenessValidationErrorMessage(
  otpCodeCompletenessValidationOutcome: OtpCodeCompletenessValidationOutcome,
) {
  return Match.valueTags(otpCodeCompletenessValidationOutcome, {
    OtpCodeCompletenessValid: () => null,
    OtpCodeIncomplete: () =>
      VALIDATE_OTP_CODE_SCREEN_MESSAGES.otpCodeIncompleteError(OTP_CODE_LENGTH),
  });
}
