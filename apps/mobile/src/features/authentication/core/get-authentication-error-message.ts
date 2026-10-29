import * as Predicate from "effect/Predicate";

import type { AuthenticationClient } from "#/shared/services/authentication-client.ts";

import { isAuthenticationRateLimited } from "#/features/authentication/core/is-authentication-rate-limited.ts";
import { GooglePlayServicesMissingError } from "#/features/authentication/errors/google-play-services-missing-error.ts";
import { GoogleSignInInProgressError } from "#/features/authentication/errors/google-sign-in-in-progress-error.ts";
import { AUTHENTICATION_MESSAGES } from "#/features/authentication/messages/authentication-messages.ts";
import { AuthenticationClientError } from "#/shared/errors/authentication-client-error.ts";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

type AuthenticationErrorCode =
  | "EMAIL_NOT_VERIFIED"
  | "OAUTH_LINK_ERROR"
  | "USER_EMAIL_NOT_FOUND"
  | keyof AuthenticationClient["Service"]["authClient"]["$ERROR_CODES"];

const AUTHENTICATION_ERROR_CODE_MESSAGES: Record<string, string | undefined> = {
  EMAIL_NOT_VERIFIED: AUTHENTICATION_MESSAGES.accountNotConnectedError,
  INVALID_EMAIL: AUTHENTICATION_MESSAGES.emailInvalidError,
  INVALID_OTP: AUTHENTICATION_MESSAGES.otpCodeInvalidError,
  OAUTH_LINK_ERROR: AUTHENTICATION_MESSAGES.accountNotConnectedError,
  OTP_EXPIRED: AUTHENTICATION_MESSAGES.otpCodeExpiredError,
  TOO_MANY_ATTEMPTS: AUTHENTICATION_MESSAGES.otpCodeAttemptsExceededError,
  USER_EMAIL_NOT_FOUND: AUTHENTICATION_MESSAGES.emailNotSharedError,
} satisfies Partial<Record<AuthenticationErrorCode, string>>;

export function getAuthenticationErrorMessage(error: unknown) {
  if (error instanceof AuthenticationClientError) {
    return getAuthenticationFailureMessage(error);
  }

  if (error instanceof GooglePlayServicesMissingError) {
    return AUTHENTICATION_MESSAGES.playServicesMissingError;
  }

  if (error instanceof GoogleSignInInProgressError) {
    return "";
  }

  return getUnexpectedErrorMessage(error);
}

function getAuthenticationFailureMessage(error: AuthenticationClientError) {
  if (error.cause !== null) {
    return getUnexpectedErrorMessage(error.cause);
  }

  if (isAuthenticationRateLimited(error)) {
    return error.retryAfterSeconds !== null && error.retryAfterSeconds > 0
      ? AUTHENTICATION_MESSAGES.requestsRateLimitedError(
          error.retryAfterSeconds,
        )
      : AUTHENTICATION_MESSAGES.requestsRateLimitedWithoutDelayError;
  }

  const errorCodeMessage =
    error.code === null ? null : AUTHENTICATION_ERROR_CODE_MESSAGES[error.code];

  return errorCodeMessage ?? SHARED_MESSAGES.unknownError;
}

function getUnexpectedErrorMessage(error: unknown) {
  return Predicate.hasProperty(error, "code")
    ? SHARED_MESSAGES.unknownError
    : SHARED_MESSAGES.serverUnreachableError;
}
