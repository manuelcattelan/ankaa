import type { WorkoutInProgressConflictError } from "@ankaa/core/features/workout/errors/workout-in-progress-conflict-error";
import type { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";

import * as Match from "effect/Match";

import type { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { getTrpcClientErrorMessage } from "#/shared/core/get-trpc-client-error-message.ts";

export function getWorkoutStartErrorMessage(
  error:
    RoutineNotFoundError | TrpcClientError | WorkoutInProgressConflictError,
) {
  return Match.valueTags(error, {
    RoutineNotFoundError: () => WORKOUT_MESSAGES.routineNotFoundError,
    TrpcClientError: (trpcClientError) =>
      getTrpcClientErrorMessage(trpcClientError),
    WorkoutInProgressConflictError: () =>
      WORKOUT_MESSAGES.workoutInProgressConflictError,
  });
}
