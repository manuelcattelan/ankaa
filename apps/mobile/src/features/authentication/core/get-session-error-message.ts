import type { AuthenticationClient } from "@/shared/services/authentication-client";

import { getAuthenticationErrorMessage } from "@/features/authentication/core/get-authentication-error-message";

type AuthenticationSession = ReturnType<
  AuthenticationClient["Service"]["betterAuthenticationClient"]["useSession"]
>;

export function getSessionErrorMessage(
  authenticationSession: AuthenticationSession,
) {
  if (
    !authenticationSession.error ||
    authenticationSession.data ||
    typeof authenticationSession.error.status === "number"
  ) {
    return undefined;
  }

  return getAuthenticationErrorMessage(authenticationSession.error);
}
