import type { WorkoutDocumentExercise } from "@/features/workout/core/workout-document-schema";

type GetWorkoutDocumentRoutineExerciseSetOptions = {
  position: number;
  workoutDocumentExercise: WorkoutDocumentExercise;
};

export function getWorkoutDocumentRoutineExerciseSet({
  position,
  workoutDocumentExercise,
}: GetWorkoutDocumentRoutineExerciseSetOptions) {
  return workoutDocumentExercise.routineExerciseSets.at(
    Math.min(position, workoutDocumentExercise.routineExerciseSets.length - 1),
  );
}
