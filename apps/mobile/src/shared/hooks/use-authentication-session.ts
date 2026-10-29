import { useAuthenticationClient } from "#/shared/hooks/use-authentication-client.ts";

export function useAuthenticationSession() {
  const authenticationClient = useAuthenticationClient();

  return authenticationClient.betterAuthenticationClient.useSession();
}
