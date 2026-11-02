import type { AbsenceDateConflictError } from "@ankaa/core/features/absence/errors/absence-date-conflict-error";
import type { AbsenceDateInFutureError } from "@ankaa/core/features/absence/errors/absence-date-in-future-error";
import type { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";

import * as Match from "effect/Match";

import type { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

import { ABSENCE_MESSAGES } from "#/features/absence/messages/absence-messages.ts";
import { getTrpcClientErrorMessage } from "#/shared/core/get-trpc-client-error-message.ts";

export function getAbsenceRecordErrorMessage(
  error:
    | AbsenceDateConflictError
    | AbsenceDateInFutureError
    | RoutineNotFoundError
    | TrpcClientError,
) {
  return Match.valueTags(error, {
    AbsenceDateConflictError: () => ABSENCE_MESSAGES.absenceDateConflictError,
    AbsenceDateInFutureError: () => ABSENCE_MESSAGES.absenceDateInFutureError,
    RoutineNotFoundError: () => ABSENCE_MESSAGES.routineNotFoundError,
    TrpcClientError: (trpcClientError) =>
      getTrpcClientErrorMessage(trpcClientError),
  });
}
