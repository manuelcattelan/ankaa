import { isTRPCClientError } from "@trpc/client";
import * as Predicate from "effect/Predicate";

import { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

/**
 * Maps a failed call, wrapped in a `TrpcClientError` or not, to the message
 * the User sees: the unknown error message when the server answered, and the
 * server unreachable message when it didn't.
 */
export function getTrpcClientErrorMessage(error: unknown) {
  const cause = error instanceof TrpcClientError ? error.cause : error;

  if (isTRPCClientError(cause) && Predicate.isNotNullish(cause.data)) {
    return SHARED_MESSAGES.unknownError;
  }

  return SHARED_MESSAGES.serverUnreachableError;
}
