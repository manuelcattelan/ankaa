import type { WorkoutSaveInput } from "@ankaa/core/features/workout/schemas/workout-save-input-schema";

import * as Data from "effect/Data";

type DecideWorkoutSaveOptions = {
  userId: string;
  workoutRoutine: undefined | WorkoutRoutine;
  workoutSaveInput: WorkoutSaveInput;
  workoutsInProgress: readonly unknown[];
  workoutWithSameId: undefined | WorkoutWithSameId;
};

type WorkoutRoutine = {
  readonly id: string;
};

type WorkoutSaveOutcome = Data.TaggedEnum<{
  RoutineNotFound: object;
  WorkoutInProgressConflict: object;
  WorkoutNotFound: object;
  WorkoutSaveAllowed: object;
  WorkoutVersionAlreadySaved: object;
}>;

type WorkoutWithSameId = {
  readonly userId: string;
  readonly version: number;
};

const WorkoutSaveOutcome = Data.taggedEnum<WorkoutSaveOutcome>();

export function decideWorkoutSave({
  userId,
  workoutRoutine,
  workoutSaveInput,
  workoutsInProgress,
  workoutWithSameId,
}: DecideWorkoutSaveOptions) {
  if (workoutRoutine === undefined) {
    return WorkoutSaveOutcome.RoutineNotFound();
  }

  if (
    typeof workoutSaveInput.endedAt !== "string" &&
    workoutsInProgress.length > 0
  ) {
    return WorkoutSaveOutcome.WorkoutInProgressConflict();
  }

  if (workoutWithSameId === undefined) {
    return WorkoutSaveOutcome.WorkoutSaveAllowed();
  }

  if (workoutWithSameId.userId !== userId) {
    return WorkoutSaveOutcome.WorkoutNotFound();
  }

  if (workoutWithSameId.version >= workoutSaveInput.version) {
    return WorkoutSaveOutcome.WorkoutVersionAlreadySaved();
  }

  return WorkoutSaveOutcome.WorkoutSaveAllowed();
}
