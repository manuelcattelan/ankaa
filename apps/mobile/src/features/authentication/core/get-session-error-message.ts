import type { AuthenticationClient } from "#/shared/services/authentication-client.ts";

import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

type AuthenticationSession = ReturnType<
  AuthenticationClient["Service"]["authClient"]["useSession"]
>;

export function getSessionErrorMessage(
  authenticationSession: AuthenticationSession,
) {
  if (
    authenticationSession.error === null ||
    authenticationSession.data !== null ||
    typeof authenticationSession.error.status === "number"
  ) {
    return null;
  }

  return SHARED_MESSAGES.serverUnreachableError;
}
