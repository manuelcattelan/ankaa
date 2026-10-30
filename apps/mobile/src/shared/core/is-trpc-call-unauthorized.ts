import type { AppRouter } from "@ankaa/api/trpc/app-router";

import { isTRPCClientError } from "@trpc/client";

/**
 * Whether the server rejected a tRPC call with `UNAUTHORIZED`, which it does
 * when the session the call carries no longer exists.
 */
export function isTrpcCallUnauthorized(cause: unknown) {
  return (
    isTRPCClientError<AppRouter>(cause) && cause.data?.code === "UNAUTHORIZED"
  );
}
