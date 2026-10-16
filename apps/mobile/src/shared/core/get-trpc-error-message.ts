import { isTRPCClientError } from "@trpc/client";

import { TrpcError } from "@/shared/errors/trpc-error";
import { messages } from "@/utilities/messages";

export function getTrpcErrorMessage(error: unknown) {
  const trpcClientError = error instanceof TrpcError ? error.cause : error;

  if (isTRPCClientError(trpcClientError) && trpcClientError.data) {
    return messages.error.unknown;
  }

  return messages.error.serverUnreachable;
}
