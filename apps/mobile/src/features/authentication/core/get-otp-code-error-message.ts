import { getAuthenticationErrorMessage } from "@/features/authentication/core/get-authentication-error-message";
import { isAuthenticationRateLimited } from "@/features/authentication/core/is-authentication-rate-limited";
import { authenticationErrorMessages } from "@/features/authentication/messages/authentication-error-messages";

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
      ? authenticationErrorMessages.requestsRateLimited(
          cooldownRemainingSeconds,
        )
      : undefined;
  }

  return getAuthenticationErrorMessage(error);
}
