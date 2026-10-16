import * as Predicate from "effect/Predicate";

import type { AuthenticationClient } from "@/shared/services/authentication-client";

import { isAuthenticationRateLimited } from "@/features/authentication/core/is-authentication-rate-limited";
import { GooglePlayServicesMissingError } from "@/features/authentication/errors/google-play-services-missing-error";
import { GoogleSignInInProgressError } from "@/features/authentication/errors/google-sign-in-in-progress-error";
import { authenticationErrorMessages } from "@/features/authentication/messages/authentication-error-messages";
import { AuthenticationError } from "@/shared/errors/authentication-error";
import { errorMessages } from "@/shared/messages/error-messages";

type AuthenticationErrorCode =
  | "EMAIL_NOT_VERIFIED"
  | "OAUTH_LINK_ERROR"
  | "USER_EMAIL_NOT_FOUND"
  | keyof AuthenticationClient["Service"]["betterAuthenticationClient"]["$ERROR_CODES"];

const AUTHENTICATION_ERROR_CODE_MESSAGES: Record<string, string | undefined> = {
  EMAIL_NOT_VERIFIED: authenticationErrorMessages.accountNotConnected,
  INVALID_EMAIL: authenticationErrorMessages.emailInvalid,
  INVALID_OTP: authenticationErrorMessages.otpCodeInvalid,
  OAUTH_LINK_ERROR: authenticationErrorMessages.accountNotConnected,
  OTP_EXPIRED: authenticationErrorMessages.otpCodeExpired,
  TOO_MANY_ATTEMPTS: authenticationErrorMessages.otpCodeAttemptsExceeded,
  USER_EMAIL_NOT_FOUND: authenticationErrorMessages.emailNotShared,
} satisfies Partial<Record<AuthenticationErrorCode, string>>;

export function getAuthenticationErrorMessage(error: unknown) {
  if (error instanceof AuthenticationError) {
    return getAuthenticationFailureMessage(error);
  }

  if (error instanceof GooglePlayServicesMissingError) {
    return authenticationErrorMessages.playServicesMissing;
  }

  if (error instanceof GoogleSignInInProgressError) {
    return "";
  }

  return getUnexpectedErrorMessage(error);
}

function getAuthenticationFailureMessage(error: AuthenticationError) {
  if (error.cause !== undefined) {
    return getUnexpectedErrorMessage(error.cause);
  }

  if (isAuthenticationRateLimited(error)) {
    return error.retryAfterSeconds
      ? authenticationErrorMessages.requestsRateLimited(error.retryAfterSeconds)
      : authenticationErrorMessages.requestsRateLimitedWithoutDelay;
  }

  const errorCodeMessage = error.code
    ? AUTHENTICATION_ERROR_CODE_MESSAGES[error.code]
    : undefined;

  return errorCodeMessage ?? errorMessages.unknown;
}

function getUnexpectedErrorMessage(error: unknown) {
  return Predicate.hasProperty(error, "code")
    ? errorMessages.unknown
    : errorMessages.serverUnreachable;
}
