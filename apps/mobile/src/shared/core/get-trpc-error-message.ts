import { isTRPCClientError } from "@trpc/client";

import { messages } from "@/utilities/messages";

export function getTrpcErrorMessage(error: unknown) {
  if (isTRPCClientError(error) && error.data) {
    return messages.error.unknown;
  }

  return messages.error.serverUnreachable;
}
