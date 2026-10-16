import type { WorkoutDocumentExercise } from "@/features/workout/core/workout-document-schema";

import { getWorkoutDocumentRoutineExerciseSet } from "@/features/workout/core/get-workout-document-routine-exercise-set";

type GetWorkoutDocumentExerciseRestSecondsOptions = {
  isLastExerciseOfRound: boolean;
  workoutDocumentExercise: WorkoutDocumentExercise;
};

export function getWorkoutDocumentExerciseRestSeconds({
  isLastExerciseOfRound,
  workoutDocumentExercise,
}: GetWorkoutDocumentExerciseRestSecondsOptions) {
  if (!isLastExerciseOfRound) {
    return undefined;
  }

  return getWorkoutDocumentRoutineExerciseSet({
    position: workoutDocumentExercise.sets.length,
    workoutDocumentExercise,
  })?.restSeconds;
}
