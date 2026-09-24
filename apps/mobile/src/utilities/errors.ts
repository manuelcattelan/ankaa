import {
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import type { authenticationClient } from "@/clients/authentication";

import { announceMessage } from "@/utilities/accessibility";
import {
  HTTP_STATUS_TOO_MANY_REQUESTS,
  REQUEST_CANCELED_ERROR_CODE,
} from "@/utilities/constants";
import { messages } from "@/utilities/messages";

type AuthenticationError = AuthenticationErrorDetails & Error;

type AuthenticationErrorCode =
  | "EMAIL_NOT_VERIFIED"
  | "OAUTH_LINK_ERROR"
  | "USER_EMAIL_NOT_FOUND"
  | keyof typeof authenticationClient.$ERROR_CODES;

type AuthenticationErrorDetails = {
  code?: string;
  retryAfterSeconds?: number;
  status?: number;
};

type CreateAuthenticationErrorOptions = AuthenticationErrorDetails & {
  message: string;
};

const AUTHENTICATION_ERROR_NAME = "AuthenticationError";

const HTTP_STATUS_SERVER_ERROR_MINIMUM = 500;

const authenticationErrorMessages: Record<string, string | undefined> = {
  EMAIL_NOT_VERIFIED: messages.error.accountNotConnected,
  INVALID_EMAIL: messages.error.invalidEmail,
  INVALID_OTP: messages.error.invalidOtpCode,
  OAUTH_LINK_ERROR: messages.error.accountNotConnected,
  OTP_EXPIRED: messages.error.otpCodeExpired,
  TOO_MANY_ATTEMPTS: messages.error.tooManyAttempts,
  USER_EMAIL_NOT_FOUND: messages.error.emailNotShared,
} satisfies Partial<Record<AuthenticationErrorCode, string>>;

export function announceAuthenticationError(error: unknown) {
  announceMessage(getAuthenticationErrorMessage(error));
}

export function createAuthenticationError({
  message,
  ...details
}: CreateAuthenticationErrorOptions) {
  return Object.assign(new Error(message), {
    ...details,
    name: AUTHENTICATION_ERROR_NAME,
  });
}

export function getAuthenticationErrorMessage(error: unknown) {
  if (isAuthenticationError(error)) {
    return getAuthenticationFailureMessage(error);
  }

  if (isErrorWithCode(error)) {
    return getSignInErrorMessage(error.code);
  }

  return messages.error.network;
}

export function isAuthenticationError(
  error: unknown,
): error is AuthenticationError {
  return error instanceof Error && error.name === AUTHENTICATION_ERROR_NAME;
}

function getAuthenticationFailureMessage(error: AuthenticationError) {
  if (error.status === HTTP_STATUS_TOO_MANY_REQUESTS) {
    return error.retryAfterSeconds
      ? messages.error.rateLimited(error.retryAfterSeconds)
      : messages.error.rateLimitedShortly;
  }

  const errorCodeMessage = error.code
    ? authenticationErrorMessages[error.code]
    : undefined;

  if (errorCodeMessage) {
    return errorCodeMessage;
  }

  if (error.status && error.status >= HTTP_STATUS_SERVER_ERROR_MINIMUM) {
    return messages.error.server;
  }

  return messages.error.generic;
}

function getSignInErrorMessage(errorCode: string) {
  if (errorCode === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    return messages.error.playServicesMissing;
  }

  if (
    errorCode === statusCodes.IN_PROGRESS ||
    errorCode === REQUEST_CANCELED_ERROR_CODE
  ) {
    return "";
  }

  return messages.error.generic;
}
