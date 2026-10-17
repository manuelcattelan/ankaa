import { useAuthenticationClient } from "@/shared/hooks/use-authentication-client";

export function useAuthenticationSession() {
  const authenticationClient = useAuthenticationClient();

  return authenticationClient.betterAuthenticationClient.useSession();
}
