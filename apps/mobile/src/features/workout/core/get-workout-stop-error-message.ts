import type { SkipReasonMissingError } from "@ankaa/core/features/workout/errors/skip-reason-missing-error";
import type { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";

import * as Match from "effect/Match";

import type { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { getTrpcClientErrorMessage } from "#/shared/core/get-trpc-client-error-message.ts";

export function getWorkoutStopErrorMessage(
  error: SkipReasonMissingError | TrpcClientError | WorkoutNotFoundError,
) {
  return Match.valueTags(error, {
    SkipReasonMissingError: () => WORKOUT_MESSAGES.skipReasonMissingError,
    TrpcClientError: (trpcClientError) =>
      getTrpcClientErrorMessage(trpcClientError),
    WorkoutNotFoundError: () => WORKOUT_MESSAGES.workoutNotFoundError,
  });
}
