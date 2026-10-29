import * as Schema from "effect/Schema";

import { OtpCodeAttemptsExceededError } from "#/shared/errors/otp-code-attempts-exceeded-error.ts";
import { OtpCodeExpiredError } from "#/shared/errors/otp-code-expired-error.ts";
import { OtpCodeInvalidError } from "#/shared/errors/otp-code-invalid-error.ts";

/**
 * Whether a failed sign-in rejected the verification code itself, after
 * which the code the User typed can't be used again.
 */
export const isOtpCodeRejection = Schema.is(
  Schema.Union([
    OtpCodeAttemptsExceededError,
    OtpCodeExpiredError,
    OtpCodeInvalidError,
  ]),
);
