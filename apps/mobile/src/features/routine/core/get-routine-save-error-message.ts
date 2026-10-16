import type { AppRouter } from "@ankaa/api/trpc/router";

import { isTRPCClientError } from "@trpc/client";

import { routineEditorMessages } from "@/features/routine/messages/routine-editor-messages";
import { getTrpcErrorMessage } from "@/shared/core/get-trpc-error-message";
import { TrpcError } from "@/shared/errors/trpc-error";

export function getRoutineSaveErrorMessage(error: unknown) {
  if (
    error instanceof TrpcError &&
    isTRPCClientError<AppRouter>(error.cause) &&
    error.cause.data?.code === "CONFLICT"
  ) {
    return routineEditorMessages.routineNameTakenError;
  }

  return getTrpcErrorMessage(error);
}
