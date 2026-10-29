import { isTRPCClientError } from "@trpc/client";

import { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";
import { ERROR_MESSAGES } from "#/shared/messages/error-messages.ts";

export function getTrpcErrorMessage(error: unknown) {
  const trpcClientError =
    error instanceof TrpcClientError ? error.cause : error;

  if (isTRPCClientError(trpcClientError) && trpcClientError.data) {
    return ERROR_MESSAGES.unknown;
  }

  return ERROR_MESSAGES.serverUnreachable;
}
