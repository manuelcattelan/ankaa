import type { AppRouter } from "@ankaa/api/trpc/router";

import { isTRPCClientError } from "@trpc/client";

import { TrpcError } from "@/shared/errors/trpc-error";

export function getTrpcErrorCode(error: unknown) {
  if (error instanceof TrpcError && isTRPCClientError<AppRouter>(error.cause)) {
    return error.cause.data?.code;
  }

  return undefined;
}
