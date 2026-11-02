import type { WorkoutStopInput } from "@ankaa/core/features/workout/schemas/workout-stop-input-schema";
import type { SetType } from "@ankaa/core/shared/constants/set-types";
import type { SkipReason } from "@ankaa/core/shared/constants/skip-reasons";

import { isWorkoutExerciseDone } from "@ankaa/core/features/workout/core/is-workout-exercise-done";
import { SkipReasonMissingError } from "@ankaa/core/features/workout/errors/skip-reason-missing-error";
import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";

/**
 * Decides whether stopping a Workout writes, and which of its Workout
 * exercises it Skips, given the Workout with the stopped id, or `null` when
 * none has it. The stop gives one Skip, with its reason and note, to every
 * Workout exercise that isn't done, and needs a reason only when it Skips
 * one, so its Skip is `null` when every Workout exercise is done. Stopping a
 * Workout the User already stopped writes nothing and succeeds, so a stop
 * retried without knowing whether the first one succeeded ends where the
 * User meant.
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

  const workoutExerciseIds = workout.workoutExercises
    .filter((workoutExercise) => !isWorkoutExerciseDone(workoutExercise))
    .map((workoutExercise) => workoutExercise.id);

  if (workoutExerciseIds.length === 0) {
    return {
      _tag: "WorkoutStopAllowed" as const,
      skip: null,
      workoutExerciseIds,
    };
  }

  if (input.reason === null) {
    return new SkipReasonMissingError();
  }

  return {
    _tag: "WorkoutStopAllowed" as const,
    skip: { note: input.note, reason: input.reason },
    workoutExerciseIds,
  };
}
