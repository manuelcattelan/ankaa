import * as Data from "effect/Data";

import { OTP_CODE_LENGTH } from "@/features/authentication/constants/otp-code";

export type OtpCodeCompletenessValidationOutcome = Data.TaggedEnum<{
  OtpCodeCompletenessValid: object;
  OtpCodeIncomplete: object;
}>;

const OtpCodeCompletenessValidationOutcome =
  Data.taggedEnum<OtpCodeCompletenessValidationOutcome>();

export function validateOtpCodeCompleteness(otpCode: string) {
  return otpCode.length === OTP_CODE_LENGTH
    ? OtpCodeCompletenessValidationOutcome.OtpCodeCompletenessValid()
    : OtpCodeCompletenessValidationOutcome.OtpCodeIncomplete();
}
