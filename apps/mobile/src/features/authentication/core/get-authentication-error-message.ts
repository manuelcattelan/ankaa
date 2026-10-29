import * as Match from "effect/Match";
import * as Schema from "effect/Schema";

import { GooglePlayServicesMissingError } from "#/features/authentication/errors/google-play-services-missing-error.ts";
import { AUTHENTICATION_MESSAGES } from "#/features/authentication/messages/authentication-messages.ts";
import { AccountNotLinkedError } from "#/shared/errors/account-not-linked-error.ts";
import { AuthenticationClientError } from "#/shared/errors/authentication-client-error.ts";
import { DeleteAccountTokenInvalidError } from "#/shared/errors/delete-account-token-invalid-error.ts";
import { EmailInvalidError } from "#/shared/errors/email-invalid-error.ts";
import { EmailNotSharedError } from "#/shared/errors/email-not-shared-error.ts";
import { OtpCodeAttemptsExceededError } from "#/shared/errors/otp-code-attempts-exceeded-error.ts";
import { OtpCodeExpiredError } from "#/shared/errors/otp-code-expired-error.ts";
import { OtpCodeInvalidError } from "#/shared/errors/otp-code-invalid-error.ts";
import { RateLimitedError } from "#/shared/errors/rate-limited-error.ts";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

const authenticationErrorSchema = Schema.Union([
  AccountNotLinkedError,
  AuthenticationClientError,
  DeleteAccountTokenInvalidError,
  EmailInvalidError,
  EmailNotSharedError,
  GooglePlayServicesMissingError,
  OtpCodeAttemptsExceededError,
  OtpCodeExpiredError,
  OtpCodeInvalidError,
  RateLimitedError,
]);

const isAuthenticationError = Schema.is(authenticationErrorSchema);

/**
 * Maps every error that an authentication screen acts on to the message its
 * User sees. A rejected mutation can also carry a defect, which its error
 * type doesn't show, and a defect gets the unknown error message.
 */
export function getAuthenticationErrorMessage(
  error: typeof authenticationErrorSchema.Type,
) {
  if (!isAuthenticationError(error)) {
    return SHARED_MESSAGES.unknownError;
  }

  return Match.valueTags(error, {
    AccountNotLinkedError: () => AUTHENTICATION_MESSAGES.accountNotLinkedError,
    AuthenticationClientError: () => SHARED_MESSAGES.serverUnreachableError,
    DeleteAccountTokenInvalidError: () =>
      AUTHENTICATION_MESSAGES.deleteAccountTokenInvalidError,
    EmailInvalidError: () => AUTHENTICATION_MESSAGES.emailInvalidError,
    EmailNotSharedError: () => AUTHENTICATION_MESSAGES.emailNotSharedError,
    GooglePlayServicesMissingError: () =>
      AUTHENTICATION_MESSAGES.playServicesMissingError,
    OtpCodeAttemptsExceededError: () =>
      AUTHENTICATION_MESSAGES.otpCodeAttemptsExceededError,
    OtpCodeExpiredError: () => AUTHENTICATION_MESSAGES.otpCodeExpiredError,
    OtpCodeInvalidError: () => AUTHENTICATION_MESSAGES.otpCodeInvalidError,
    RateLimitedError: ({ retryAfterSeconds }) =>
      retryAfterSeconds === null
        ? AUTHENTICATION_MESSAGES.requestsRateLimitedWithoutDelayError
        : AUTHENTICATION_MESSAGES.requestsRateLimitedError(retryAfterSeconds),
  });
}
