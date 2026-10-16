import {
  WEIGHT_VALUE_MAXIMUM,
  WEIGHT_VALUE_MINIMUM,
} from "@ankaa/core/features/workout/constants/weight";
import * as Match from "effect/Match";

import type { WorkoutDocumentExerciseSetSegmentValidationOutcomes } from "@/features/workout/core/validate-workout-document-exercise-set-segment";

import { workoutScreenMessages } from "@/features/workout/messages/workout-screen-messages";
import { getWholeNumberValidationErrorMessage } from "@/shared/core/get-whole-number-validation-error-message";

export function getWorkoutDocumentExerciseSetSegmentValidationErrorMessages(
  workoutDocumentExerciseSetSegmentValidationOutcomes: WorkoutDocumentExerciseSetSegmentValidationOutcomes,
) {
  return {
    amount: getWholeNumberValidationErrorMessage(
      workoutDocumentExerciseSetSegmentValidationOutcomes.amount,
    ),
    weightValue: Match.valueTags(
      workoutDocumentExerciseSetSegmentValidationOutcomes.weightValue,
      {
        WeightValueOutOfRange: () =>
          workoutScreenMessages.weightValueOutOfRangeError({
            maximum: WEIGHT_VALUE_MAXIMUM,
            minimum: WEIGHT_VALUE_MINIMUM,
          }),
        WeightValueValid: () => undefined,
      },
    ),
  };
}
