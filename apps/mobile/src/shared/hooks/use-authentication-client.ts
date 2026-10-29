import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { AuthenticationClient } from "#/shared/services/authentication-client.ts";

export function useAuthenticationClient() {
  const runtime = useRuntime();

  return runtime.runSync(AuthenticationClient);
}
