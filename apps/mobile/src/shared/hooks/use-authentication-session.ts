import { use } from "react";

import { AuthClientContext } from "#/shared/providers/auth-client-context.ts";

export function useAuthenticationSession() {
  const authClient = use(AuthClientContext);

  if (authClient === null) {
    throw new Error(
      "useAuthenticationSession must be called inside AuthClientContext",
    );
  }

  return authClient.useSession();
}
