import type {
  WorkoutDocument,
  WorkoutDocumentExercise,
} from "@/features/workout/core/workout-document-schema";

type GetWorkoutDocumentWarmUpForExerciseNameOptions = {
  exerciseNames: Map<string, string>;
  warmUpWorkoutDocumentExercise: WorkoutDocumentExercise;
  workoutDocument: WorkoutDocument;
};

export function getWorkoutDocumentWarmUpForExerciseName({
  exerciseNames,
  warmUpWorkoutDocumentExercise,
  workoutDocument,
}: GetWorkoutDocumentWarmUpForExerciseNameOptions) {
  if (warmUpWorkoutDocumentExercise.warmUpForWorkoutExerciseId === undefined) {
    return undefined;
  }

  const warmUpForWorkoutDocumentExercise = workoutDocument.exercises.find(
    (workoutDocumentExercise) =>
      workoutDocumentExercise.id ===
      warmUpWorkoutDocumentExercise.warmUpForWorkoutExerciseId,
  );

  return (
    exerciseNames.get(warmUpForWorkoutDocumentExercise?.exerciseId ?? "") ?? ""
  );
}
