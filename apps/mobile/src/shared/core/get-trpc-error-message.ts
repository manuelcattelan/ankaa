import { isTRPCClientError } from "@trpc/client";

import { TrpcError } from "#/shared/errors/trpc-error.ts";
import { errorMessages } from "#/shared/messages/error-messages.ts";

export function getTrpcErrorMessage(error: unknown) {
  const trpcClientError = error instanceof TrpcError ? error.cause : error;

  if (isTRPCClientError(trpcClientError) && trpcClientError.data) {
    return errorMessages.unknown;
  }

  return errorMessages.serverUnreachable;
}
