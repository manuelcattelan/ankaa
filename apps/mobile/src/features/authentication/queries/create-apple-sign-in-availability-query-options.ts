import { queryOptions } from "@tanstack/react-query";

import type { ApplicationRuntime } from "@/layer";

import { checkAppleSignInAvailability } from "@/features/authentication/interactors/check-apple-sign-in-availability";

export function createAppleSignInAvailabilityQueryOptions(
  runtime: ApplicationRuntime,
) {
  return queryOptions({
    gcTime: Infinity,
    queryFn: () => runtime.runPromise(checkAppleSignInAvailability()),
    queryKey: ["apple-authentication-available"],
    staleTime: Infinity,
  });
}
