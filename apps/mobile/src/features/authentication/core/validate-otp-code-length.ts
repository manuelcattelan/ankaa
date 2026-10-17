import * as Data from "effect/Data";

import { OTP_CODE_LENGTH } from "@/features/authentication/constants/otp-code";

export type OtpCodeLengthValidationOutcome = Data.TaggedEnum<{
  OtpCodeLength: object;
  OtpCodeLengthValid: object;
}>;

const OtpCodeLengthValidationOutcome =
  Data.taggedEnum<OtpCodeLengthValidationOutcome>();

export function validateOtpCodeLength(otpCode: string) {
  return otpCode.length === OTP_CODE_LENGTH
    ? OtpCodeLengthValidationOutcome.OtpCodeLengthValid()
    : OtpCodeLengthValidationOutcome.OtpCodeLength();
}
