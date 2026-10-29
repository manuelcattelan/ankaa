import { isTRPCClientError } from "@trpc/client";
import * as Predicate from "effect/Predicate";

import { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

export function getTrpcErrorMessage(error: unknown) {
  const trpcClientError =
    error instanceof TrpcClientError ? error.cause : error;

  if (
    isTRPCClientError(trpcClientError) &&
    Predicate.isNotNullish(trpcClientError.data)
  ) {
    return SHARED_MESSAGES.unknownError;
  }

  return SHARED_MESSAGES.serverUnreachableError;
}
