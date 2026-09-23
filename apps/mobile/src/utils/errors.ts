import {
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { AccessibilityInfo, Platform } from "react-native";

import type { authClient } from "@/lib/auth";

type AuthErrorCode =
  | "EMAIL_NOT_VERIFIED"
  | "OAUTH_LINK_ERROR"
  | "USER_EMAIL_NOT_FOUND"
  | keyof typeof authClient.$ERROR_CODES;

interface AuthErrorOptions {
  code?: string;
  retryAfterSeconds?: number;
  status?: number;
}

type AuthResponse<T> =
  | {
      data: null;
      error: {
        code?: string;
        message?: string;
        status: number;
        statusText: string;
      };
    }
  | { data: T; error: null };

export const INVALID_EMAIL_MESSAGE =
  "Enter a valid email address, for example name@example.com.";

const GENERIC_MESSAGE = "Something went wrong. Try again.";

const NETWORK_MESSAGE =
  "Could not reach the server. Check your connection and try again.";

const SERVER_MESSAGE =
  "We're having trouble on our end. Try again in a moment.";

const CODE_MESSAGES: Record<string, string | undefined> = {
  EMAIL_NOT_VERIFIED:
    "We couldn't connect that account. Sign in with email instead.",
  INVALID_EMAIL: INVALID_EMAIL_MESSAGE,
  INVALID_OTP: "That code is not correct. Check the code and try again.",
  OAUTH_LINK_ERROR:
    "We couldn't connect that account. Sign in with email instead.",
  OTP_EXPIRED: "That code has expired. Request a new code.",
  TOO_MANY_ATTEMPTS:
    "Too many incorrect attempts. Request a new code to continue.",
  USER_EMAIL_NOT_FOUND:
    "That account did not share an email address. Try another sign-in method.",
} satisfies Partial<Record<AuthErrorCode, string>>;

export class AuthError extends Error {
  code?: string;
  retryAfterSeconds?: number;
  status?: number;
  constructor(message: string, options?: AuthErrorOptions) {
    super(message);
    this.name = "AuthError";
    this.code = options?.code;
    this.retryAfterSeconds = options?.retryAfterSeconds;
    this.status = options?.status;
  }
}

export function announce(message: string): void {
  if (!message || Platform.OS !== "ios") {
    return;
  }
  AccessibilityInfo.announceForAccessibilityWithOptions(message, {
    queue: true,
  });
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AuthError) {
    if (error.status === 429) {
      return error.retryAfterSeconds
        ? `Too many requests. Try again in ${error.retryAfterSeconds} seconds.`
        : "Too many requests. Try again in a moment.";
    }
    const message = error.code ? CODE_MESSAGES[error.code] : undefined;
    if (message) {
      return message;
    }
    if (error.status && error.status >= 500) {
      return SERVER_MESSAGE;
    }
    return GENERIC_MESSAGE;
  }
  if (isErrorWithCode(error)) {
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return "Google Play services are required to sign in with Google.";
    }
    if (
      error.code === statusCodes.IN_PROGRESS ||
      error.code === "ERR_REQUEST_CANCELED"
    ) {
      return "";
    }
    return GENERIC_MESSAGE;
  }
  return NETWORK_MESSAGE;
}

export function unwrap<T>(
  response: AuthResponse<T>,
  extra?: { retryAfterSeconds?: number },
): T {
  if (response.error) {
    throw new AuthError(response.error.message ?? response.error.statusText, {
      code: response.error.code,
      retryAfterSeconds: extra?.retryAfterSeconds,
      status: response.error.status,
    });
  }
  return response.data;
}
