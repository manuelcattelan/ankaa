import type { WorkoutDocumentExercise } from "@/features/workout/core/workout-document-schema";

export function getWorkoutDocumentExerciseBlockSection(
  workoutDocumentExercise: WorkoutDocumentExercise,
) {
  return workoutDocumentExercise.warmUpForWorkoutExerciseId === undefined
    ? workoutDocumentExercise.section
    : "main";
}
