import type { AuthenticationClient } from "#/shared/services/authentication-client.ts";

import { getAuthenticationErrorMessage } from "#/features/authentication/core/get-authentication-error-message.ts";

type AuthenticationSession = ReturnType<
  AuthenticationClient["Service"]["authClient"]["useSession"]
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
