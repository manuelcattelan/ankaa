import type { WorkoutSaveSetInput } from "@ankaa/core/features/workout/schemas/workout-save-set-input-schema";
import type { SetType } from "@ankaa/core/shared/constants/set-types";
import type { WeightType } from "@ankaa/core/shared/constants/weight-types";

import { SegmentCountInvalidError } from "@ankaa/core/features/workout/errors/segment-count-invalid-error";
import { SegmentWeightNotAllowedError } from "@ankaa/core/features/workout/errors/segment-weight-not-allowed-error";
import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";
import { getMatchingPlannedSet } from "@ankaa/core/features/workout/get-matching-planned-set";
import { getMaximumSegmentCount } from "@ankaa/core/features/workout/get-maximum-segment-count";

import { getWorkoutExerciseInProgress } from "#/features/workout/core/get-workout-exercise-in-progress.ts";

/**
 * Decides whether a Save may write a Set into a Workout exercise, given the
 * Workout exercise with its Workout, or `null` when none has its id. A Set
 * the Workout exercise already records keeps its position, and a new Set
 * takes the next one. Its Segments must fit its matching planned Set, and
 * carry no weight when the Weight type is none.
 */
export function decideRecordedSetSave({
  input,
  userId,
  workoutExercise,
}: {
  input: Pick<WorkoutSaveSetInput, "id" | "segments">;
  userId: string;
  workoutExercise: null | {
    plannedSets: readonly {
      intensityTechnique: null | { segmentCount: number };
      isToFailure: boolean;
      tempo: null | string;
      type: SetType;
    }[];
    recordedSets: readonly { id: string; position: number }[];
    weightType: WeightType;
    workout: { endedAt: Date | null; userId: string };
  };
}) {
  const workoutExerciseInProgress = getWorkoutExerciseInProgress({
    userId,
    workoutExercise,
  });

  if (workoutExerciseInProgress === null) {
    return new WorkoutNotFoundError();
  }

  const position =
    workoutExerciseInProgress.recordedSets.find(
      (recordedSet) => recordedSet.id === input.id,
    )?.position ?? workoutExerciseInProgress.recordedSets.length;
  const plannedSet = getMatchingPlannedSet({
    plannedSets: workoutExerciseInProgress.plannedSets,
    position,
  });
  const maximumSegmentCount = getMaximumSegmentCount(plannedSet);

  if (
    input.segments.length === 0 ||
    input.segments.length > maximumSegmentCount
  ) {
    return new SegmentCountInvalidError();
  }

  if (
    workoutExerciseInProgress.weightType === "none" &&
    input.segments.some((segment) => segment.weight !== null)
  ) {
    return new SegmentWeightNotAllowedError();
  }

  return { _tag: "RecordedSetSaveAllowed" as const, position };
}
