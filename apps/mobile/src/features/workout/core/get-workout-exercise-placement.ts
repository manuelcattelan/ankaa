import type { WorkoutDocumentExercise } from "@/features/workout/core/workout-document-schema";

import { getWorkoutDocumentExerciseBlockSection } from "@/features/workout/core/get-workout-document-exercise-block-section";

type GetWorkoutExercisePlacementOptions = {
  exerciseIndex: number;
  workoutDocumentExercises: readonly WorkoutDocumentExercise[];
};

export function getWorkoutExercisePlacement({
  exerciseIndex,
  workoutDocumentExercises,
}: GetWorkoutExercisePlacementOptions) {
  const workoutDocumentExercise = workoutDocumentExercises[exerciseIndex];
  const previousWorkoutDocumentExercise =
    exerciseIndex === 0
      ? undefined
      : workoutDocumentExercises[exerciseIndex - 1];
  const nextWorkoutDocumentExercise = workoutDocumentExercises.at(
    exerciseIndex + 1,
  );

  return {
    isLastExerciseOfRound:
      workoutDocumentExercise.superset === undefined ||
      nextWorkoutDocumentExercise?.superset !==
        workoutDocumentExercise.superset,
    isSectionStart:
      !previousWorkoutDocumentExercise ||
      getWorkoutDocumentExerciseBlockSection(
        previousWorkoutDocumentExercise,
      ) !== getWorkoutDocumentExerciseBlockSection(workoutDocumentExercise),
    isSupersetStart:
      workoutDocumentExercise.superset !== undefined &&
      previousWorkoutDocumentExercise?.superset !==
        workoutDocumentExercise.superset,
  };
}
