import { useRuntime } from "@/shared/hooks/use-runtime";
import { AuthenticationClient } from "@/shared/services/authentication-client";

export function useAuthenticationClient() {
  const runtime = useRuntime();

  return runtime.runSync(AuthenticationClient);
}
