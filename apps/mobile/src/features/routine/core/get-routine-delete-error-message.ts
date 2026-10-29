import type { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";

import * as Match from "effect/Match";

import type { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";
import { getTrpcErrorMessage } from "#/shared/core/get-trpc-error-message.ts";

export function getRoutineDeleteErrorMessage(
  error: RoutineNotFoundError | TrpcClientError,
) {
  return Match.valueTags(error, {
    RoutineNotFoundError: () => ROUTINE_MESSAGES.routineNotFoundError,
    TrpcClientError: (trpcClientError) => getTrpcErrorMessage(trpcClientError),
  });
}
