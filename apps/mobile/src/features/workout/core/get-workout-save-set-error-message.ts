import type { SegmentCountInvalidError } from "@ankaa/core/features/workout/errors/segment-count-invalid-error";
import type { SegmentWeightNotAllowedError } from "@ankaa/core/features/workout/errors/segment-weight-not-allowed-error";
import type { SetNotPlannedError } from "@ankaa/core/features/workout/errors/set-not-planned-error";
import type { SkipConflictError } from "@ankaa/core/features/workout/errors/skip-conflict-error";
import type { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";

import * as Match from "effect/Match";

import type { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { getTrpcClientErrorMessage } from "#/shared/core/get-trpc-client-error-message.ts";

export function getWorkoutSaveSetErrorMessage(
  error:
    | SegmentCountInvalidError
    | SegmentWeightNotAllowedError
    | SetNotPlannedError
    | SkipConflictError
    | TrpcClientError
    | WorkoutNotFoundError,
) {
  return Match.valueTags(error, {
    SegmentCountInvalidError: () => WORKOUT_MESSAGES.segmentCountInvalidError,
    SegmentWeightNotAllowedError: () =>
      WORKOUT_MESSAGES.segmentWeightNotAllowedError,
    SetNotPlannedError: () => WORKOUT_MESSAGES.setNotPlannedError,
    SkipConflictError: () => WORKOUT_MESSAGES.skipConflictError,
    TrpcClientError: (trpcClientError) =>
      getTrpcClientErrorMessage(trpcClientError),
    WorkoutNotFoundError: () => WORKOUT_MESSAGES.workoutNotFoundError,
  });
}
