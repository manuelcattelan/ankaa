import type { WorkoutDocument } from "@/features/workout/core/workout-document-schema";

import { getWorkoutDocumentExerciseSetSegmentValidationErrors } from "@/features/workout/core/get-workout-document-exercise-set-segment-validation-errors";

export function hasWorkoutDocumentValidationErrors(
  workoutDocument: WorkoutDocument,
) {
  return workoutDocument.exercises.some((workoutDocumentExercise) =>
    workoutDocumentExercise.sets.some((workoutDocumentExerciseSet) =>
      workoutDocumentExerciseSet.segments.some(
        (workoutDocumentExerciseSetSegment) =>
          Object.values(
            getWorkoutDocumentExerciseSetSegmentValidationErrors(
              workoutDocumentExerciseSetSegment,
            ),
          ).some((validationError) => !!validationError),
      ),
    ),
  );
}
