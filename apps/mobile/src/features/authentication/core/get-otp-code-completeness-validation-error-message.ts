import * as Match from "effect/Match";

import type { OtpCodeCompletenessValidationOutcome } from "#/features/authentication/core/validate-otp-code-completeness.ts";

import { OTP_CODE_LENGTH } from "#/features/authentication/constants/otp-code-length.ts";
import { AUTHENTICATION_MESSAGES } from "#/features/authentication/messages/authentication-messages.ts";

export function getOtpCodeCompletenessValidationErrorMessage(
  otpCodeCompletenessValidationOutcome: OtpCodeCompletenessValidationOutcome,
) {
  return Match.valueTags(otpCodeCompletenessValidationOutcome, {
    OtpCodeCompletenessValid: () => null,
    OtpCodeIncomplete: () =>
      AUTHENTICATION_MESSAGES.otpCodeIncompleteError(OTP_CODE_LENGTH),
  });
}
