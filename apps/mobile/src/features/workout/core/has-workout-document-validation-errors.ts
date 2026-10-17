import * as Match from "effect/Match";

import type {
  WorkoutDocument,
  WorkoutDocumentExerciseSetSegment,
} from "@/features/workout/core/workout-document-schema";

import { validateWorkoutDocumentExerciseSetSegment } from "@/features/workout/core/validate-workout-document-exercise-set-segment";

export function hasWorkoutDocumentValidationErrors(
  workoutDocument: WorkoutDocument,
) {
  return workoutDocument.exercises.some((workoutDocumentExercise) =>
    workoutDocumentExercise.sets.some(
      (workoutDocumentExerciseSet) =>
        !workoutDocumentExerciseSet.segments.every(
          isWorkoutDocumentExerciseSetSegmentValid,
        ),
    ),
  );
}

function isWorkoutDocumentExerciseSetSegmentValid(
  workoutDocumentExerciseSetSegment: WorkoutDocumentExerciseSetSegment,
) {
  return Match.valueTags(
    validateWorkoutDocumentExerciseSetSegment(
      workoutDocumentExerciseSetSegment,
    ),
    {
      WorkoutDocumentExerciseSetSegmentInvalid: () => false,
      WorkoutDocumentExerciseSetSegmentValid: () => true,
    },
  );
}
