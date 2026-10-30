import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useAuthenticationSession } from "#/shared/hooks/use-authentication-session.ts";

/**
 * Clears the query cache once nobody is signed in, so no User's data stays
 * on the device after they sign out.
 */
export function QueryCacheController() {
  const queryClient = useQueryClient();

  const session = useAuthenticationSession();

  const hasSession = session.data !== null;

  useEffect(() => {
    if (session.isPending || hasSession) {
      return;
    }

    queryClient.clear();
  }, [hasSession, queryClient, session.isPending]);

  return null;
}
