import type { WorkoutSaveInput } from "@ankaa/core/features/workout/schemas/workout-save-input-schema";

import * as Data from "effect/Data";

type DecideWorkoutSaveOptions = {
  userId: string;
  workoutInProgress: undefined | WorkoutInProgress;
  workoutRoutine: undefined | WorkoutRoutine;
  workoutSaveInput: WorkoutSaveInput;
  workoutWithSameId: undefined | WorkoutWithSameId;
};

type WorkoutInProgress = {
  readonly id: string;
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
  workoutInProgress,
  workoutRoutine,
  workoutSaveInput,
  workoutWithSameId,
}: DecideWorkoutSaveOptions) {
  if (workoutRoutine === undefined) {
    return WorkoutSaveOutcome.RoutineNotFound();
  }

  if (
    typeof workoutSaveInput.endedAt !== "string" &&
    workoutInProgress !== undefined
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
