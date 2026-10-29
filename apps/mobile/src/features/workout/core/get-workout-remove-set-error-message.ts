import type { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";

import * as Match from "effect/Match";

import type { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { getTrpcErrorMessage } from "#/shared/core/get-trpc-error-message.ts";

export function getWorkoutRemoveSetErrorMessage(
  error: TrpcClientError | WorkoutNotFoundError,
) {
  return Match.valueTags(error, {
    TrpcClientError: (trpcClientError) => getTrpcErrorMessage(trpcClientError),
    WorkoutNotFoundError: () => WORKOUT_MESSAGES.workoutNotFoundError,
  });
}
