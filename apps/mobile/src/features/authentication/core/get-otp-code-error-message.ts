import { getAuthenticationErrorMessage } from "#/features/authentication/core/get-authentication-error-message.ts";
import { isAuthenticationRateLimited } from "#/features/authentication/core/is-authentication-rate-limited.ts";
import { AUTHENTICATION_ERROR_MESSAGES } from "#/features/authentication/messages/authentication-error-messages.ts";

export function getOtpCodeErrorMessage({
  cooldownRemainingSeconds,
  error,
}: {
  cooldownRemainingSeconds: number;
  error: unknown;
}) {
  if (error === null || error === undefined) {
    return null;
  }

  if (isAuthenticationRateLimited(error)) {
    return cooldownRemainingSeconds > 0
      ? AUTHENTICATION_ERROR_MESSAGES.requestsRateLimited(
          cooldownRemainingSeconds,
        )
      : null;
  }

  return getAuthenticationErrorMessage(error);
}
