import type { RoutineNameConflictError } from "@ankaa/core/features/routine/errors/routine-name-conflict-error";
import type { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";

import * as Match from "effect/Match";

import type { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";
import { getTrpcClientErrorMessage } from "#/shared/core/get-trpc-client-error-message.ts";

export function getRoutineSaveErrorMessage(
  error: RoutineNameConflictError | RoutineNotFoundError | TrpcClientError,
) {
  return Match.valueTags(error, {
    RoutineNameConflictError: () => ROUTINE_MESSAGES.routineNameTakenError,
    RoutineNotFoundError: () => ROUTINE_MESSAGES.routineNotFoundError,
    TrpcClientError: (trpcClientError) =>
      getTrpcClientErrorMessage(trpcClientError),
  });
}
