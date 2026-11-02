import type { SkipConflictError } from "@ankaa/core/features/workout/errors/skip-conflict-error";
import type { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";

import * as Match from "effect/Match";

import type { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { getTrpcClientErrorMessage } from "#/shared/core/get-trpc-client-error-message.ts";

export function getWorkoutRemoveSetErrorMessage(
  error: SkipConflictError | TrpcClientError | WorkoutNotFoundError,
) {
  return Match.valueTags(error, {
    SkipConflictError: () => WORKOUT_MESSAGES.skipConflictError,
    TrpcClientError: (trpcClientError) =>
      getTrpcClientErrorMessage(trpcClientError),
    WorkoutNotFoundError: () => WORKOUT_MESSAGES.workoutNotFoundError,
  });
}
