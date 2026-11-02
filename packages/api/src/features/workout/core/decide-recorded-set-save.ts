import type { SkipReason } from "@ankaa/core/features/workout/constants/skip-reasons";
import type { WorkoutSaveSetInput } from "@ankaa/core/features/workout/schemas/workout-save-set-input-schema";
import type { SetType } from "@ankaa/core/shared/constants/set-types";
import type { WeightType } from "@ankaa/core/shared/constants/weight-types";

import { getMatchingPlannedSet } from "@ankaa/core/features/workout/core/get-matching-planned-set";
import { getMaximumSegmentCount } from "@ankaa/core/features/workout/core/get-maximum-segment-count";
import { SegmentCountInvalidError } from "@ankaa/core/features/workout/errors/segment-count-invalid-error";
import { SegmentWeightNotAllowedError } from "@ankaa/core/features/workout/errors/segment-weight-not-allowed-error";
import { SetNotPlannedError } from "@ankaa/core/features/workout/errors/set-not-planned-error";
import { SkipConflictError } from "@ankaa/core/features/workout/errors/skip-conflict-error";
import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";

import { getWorkoutExerciseInProgress } from "#/features/workout/core/get-workout-exercise-in-progress.ts";

/**
 * Decides whether a Save may write a Set into a Workout exercise, given the
 * Workout exercise with its Workout, or `null` when none has its id. A Skip
 * keeps the Workout exercise's Sets as they are, so no Set is written while
 * it has one. A Set the Workout exercise already records is updated and
 * keeps its position, and a new Set is created at the next one, which must
 * have a matching planned Set. Its Segments must fit its matching planned
 * Set, and carry no weight when the Weight type is none.
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
    skipReason: null | SkipReason;
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

  if (workoutExerciseInProgress.skipReason !== null) {
    return new SkipConflictError();
  }

  const recordedSetWithSameId = workoutExerciseInProgress.recordedSets.find(
    (recordedSet) => recordedSet.id === input.id,
  );
  const position =
    recordedSetWithSameId?.position ??
    workoutExerciseInProgress.recordedSets.length;
  const plannedSet = getMatchingPlannedSet({
    plannedSets: workoutExerciseInProgress.plannedSets,
    position,
  });

  if (plannedSet === null) {
    return new SetNotPlannedError();
  }

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

  if (recordedSetWithSameId === undefined) {
    return { _tag: "RecordedSetCreateAllowed" as const, position };
  }

  return { _tag: "RecordedSetUpdateAllowed" as const };
}
