import * as Schema from "effect/Schema";

import { OTP_CODE_LENGTH } from "#/features/authentication/constants/otp-code-length.ts";
import { AUTHENTICATION_MESSAGES } from "#/features/authentication/messages/authentication-messages.ts";

const otpCodeLengthFilter = Schema.isBetweenLength(
  OTP_CODE_LENGTH,
  OTP_CODE_LENGTH,
  { message: AUTHENTICATION_MESSAGES.otpCodeIncompleteError(OTP_CODE_LENGTH) },
);

export const otpCodeFormSchema = Schema.Struct({
  otpCode: Schema.String.check(otpCodeLengthFilter),
});
