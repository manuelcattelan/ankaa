import type { WorkoutStopInput } from "@ankaa/core/features/workout/schemas/workout-stop-input-schema";
import type { SetType } from "@ankaa/core/shared/constants/set-types";
import type { SkipReason } from "@ankaa/core/shared/constants/skip-reasons";

import { SkipReasonMissingError } from "@ankaa/core/features/workout/errors/skip-reason-missing-error";
import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";

/**
 * Decides whether stopping a Workout writes, and which of its Workout
 * exercises it Skips, given the Workout with the stopped id, or `null` when
 * none has it. The stop Skips, with its reason and note, every Workout
 * exercise that has no Skip and fewer recorded Working sets than planned, and
 * needs a reason only when it Skips one. Stopping a Workout the User already
 * stopped writes nothing and succeeds, so a stop retried without knowing
 * whether the first one succeeded ends where the User meant.
 */
export function decideWorkoutStop({
  input,
  userId,
  workout,
}: {
  input: Pick<WorkoutStopInput, "note" | "reason">;
  userId: string;
  workout: null | {
    endedAt: Date | null;
    userId: string;
    workoutExercises: readonly {
      id: string;
      plannedSets: readonly { type: SetType }[];
      recordedSetCount: number;
      skipReason: null | SkipReason;
    }[];
  };
}) {
  if (workout?.userId !== userId) {
    return new WorkoutNotFoundError();
  }

  if (workout.endedAt !== null) {
    return { _tag: "WorkoutAlreadyStopped" as const };
  }

  const skippedWorkoutExercises = workout.workoutExercises.filter(
    (workoutExercise) =>
      workoutExercise.skipReason === null &&
      isWorkingSetMissing(workoutExercise),
  );

  if (skippedWorkoutExercises.length === 0) {
    return { _tag: "WorkoutStopAllowed" as const, skips: [] };
  }

  if (input.reason === null) {
    return new SkipReasonMissingError();
  }

  const skip = { note: input.note, reason: input.reason };

  return {
    _tag: "WorkoutStopAllowed" as const,
    skips: skippedWorkoutExercises.map((workoutExercise) => ({
      ...skip,
      workoutExerciseId: workoutExercise.id,
    })),
  };
}

/**
 * Tells whether a Workout exercise records fewer Working sets than it plans,
 * counting as a Working set each recorded Set whose matching planned Set is
 * one.
 */
function isWorkingSetMissing({
  plannedSets,
  recordedSetCount,
}: {
  plannedSets: readonly { type: SetType }[];
  recordedSetCount: number;
}) {
  const plannedWorkingSetCount = plannedSets.filter(
    (plannedSet) => plannedSet.type === "working",
  ).length;
  const recordedWorkingSetCount = plannedSets
    .slice(0, recordedSetCount)
    .filter((plannedSet) => plannedSet.type === "working").length;

  return recordedWorkingSetCount < plannedWorkingSetCount;
}
