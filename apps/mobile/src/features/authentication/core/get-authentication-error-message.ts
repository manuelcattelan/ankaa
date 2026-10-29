import * as Predicate from "effect/Predicate";

import type { AuthenticationClient } from "#/shared/services/authentication-client.ts";

import { isAuthenticationRateLimited } from "#/features/authentication/core/is-authentication-rate-limited.ts";
import { GooglePlayServicesMissingError } from "#/features/authentication/errors/google-play-services-missing-error.ts";
import { GoogleSignInInProgressError } from "#/features/authentication/errors/google-sign-in-in-progress-error.ts";
import { AUTHENTICATION_ERROR_MESSAGES } from "#/features/authentication/messages/authentication-error-messages.ts";
import { AuthenticationClientError } from "#/shared/errors/authentication-client-error.ts";
import { ERROR_MESSAGES } from "#/shared/messages/error-messages.ts";

type AuthenticationErrorCode =
  | "EMAIL_NOT_VERIFIED"
  | "OAUTH_LINK_ERROR"
  | "USER_EMAIL_NOT_FOUND"
  | keyof AuthenticationClient["Service"]["authClient"]["$ERROR_CODES"];

const AUTHENTICATION_ERROR_CODE_MESSAGES: Record<string, string | undefined> = {
  EMAIL_NOT_VERIFIED: AUTHENTICATION_ERROR_MESSAGES.accountNotConnected,
  INVALID_EMAIL: AUTHENTICATION_ERROR_MESSAGES.emailInvalid,
  INVALID_OTP: AUTHENTICATION_ERROR_MESSAGES.otpCodeInvalid,
  OAUTH_LINK_ERROR: AUTHENTICATION_ERROR_MESSAGES.accountNotConnected,
  OTP_EXPIRED: AUTHENTICATION_ERROR_MESSAGES.otpCodeExpired,
  TOO_MANY_ATTEMPTS: AUTHENTICATION_ERROR_MESSAGES.otpCodeAttemptsExceeded,
  USER_EMAIL_NOT_FOUND: AUTHENTICATION_ERROR_MESSAGES.emailNotShared,
} satisfies Partial<Record<AuthenticationErrorCode, string>>;

export function getAuthenticationErrorMessage(error: unknown) {
  if (error instanceof AuthenticationClientError) {
    return getAuthenticationFailureMessage(error);
  }

  if (error instanceof GooglePlayServicesMissingError) {
    return AUTHENTICATION_ERROR_MESSAGES.playServicesMissing;
  }

  if (error instanceof GoogleSignInInProgressError) {
    return "";
  }

  return getUnexpectedErrorMessage(error);
}

function getAuthenticationFailureMessage(error: AuthenticationClientError) {
  if (error.cause !== undefined) {
    return getUnexpectedErrorMessage(error.cause);
  }

  if (isAuthenticationRateLimited(error)) {
    return error.retryAfterSeconds
      ? AUTHENTICATION_ERROR_MESSAGES.requestsRateLimited(
          error.retryAfterSeconds,
        )
      : AUTHENTICATION_ERROR_MESSAGES.requestsRateLimitedWithoutDelay;
  }

  const errorCodeMessage = error.code
    ? AUTHENTICATION_ERROR_CODE_MESSAGES[error.code]
    : null;

  return errorCodeMessage ?? ERROR_MESSAGES.unknown;
}

function getUnexpectedErrorMessage(error: unknown) {
  return Predicate.hasProperty(error, "code")
    ? ERROR_MESSAGES.unknown
    : ERROR_MESSAGES.serverUnreachable;
}
