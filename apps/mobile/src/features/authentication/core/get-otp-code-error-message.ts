import { getAuthenticationErrorMessage } from "#/features/authentication/core/get-authentication-error-message.ts";
import { isAuthenticationRateLimited } from "#/features/authentication/core/is-authentication-rate-limited.ts";
import { AUTHENTICATION_ERROR_MESSAGES } from "#/features/authentication/messages/authentication-error-messages.ts";

type GetOtpCodeErrorMessageOptions = {
  cooldownRemainingSeconds: number;
  error: unknown;
};

export function getOtpCodeErrorMessage({
  cooldownRemainingSeconds,
  error,
}: GetOtpCodeErrorMessageOptions) {
  if (!error) {
    return undefined;
  }

  if (isAuthenticationRateLimited(error)) {
    return cooldownRemainingSeconds > 0
      ? AUTHENTICATION_ERROR_MESSAGES.requestsRateLimited(
          cooldownRemainingSeconds,
        )
      : undefined;
  }

  return getAuthenticationErrorMessage(error);
}
