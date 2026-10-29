import { queryOptions } from "@tanstack/react-query";

import type { ApplicationRuntime } from "#/layer.ts";

import { checkAppleSignInAvailability } from "#/features/authentication/interactors/check-apple-sign-in-availability.ts";

export function createAppleSignInAvailabilityQueryOptions(
  runtime: ApplicationRuntime,
) {
  return queryOptions({
    gcTime: Infinity,
    queryFn: () => runtime.runPromise(checkAppleSignInAvailability()),
    queryKey: ["apple-sign-in-availability"],
    staleTime: Infinity,
  });
}
