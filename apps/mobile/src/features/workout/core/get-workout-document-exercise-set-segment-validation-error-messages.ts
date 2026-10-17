import {
  WEIGHT_VALUE_MAXIMUM,
  WEIGHT_VALUE_MINIMUM,
} from "@ankaa/core/features/workout/constants/weight";
import * as Match from "effect/Match";

import type { WorkoutDocumentExerciseSetSegmentValidationOutcome } from "@/features/workout/core/validate-workout-document-exercise-set-segment";

import { workoutScreenMessages } from "@/features/workout/messages/workout-screen-messages";
import { getWholeNumberValidationErrorMessage } from "@/shared/core/get-whole-number-validation-error-message";

export function getWorkoutDocumentExerciseSetSegmentValidationErrorMessages(
  workoutDocumentExerciseSetSegmentValidationOutcome: WorkoutDocumentExerciseSetSegmentValidationOutcome,
) {
  return Match.valueTags(workoutDocumentExerciseSetSegmentValidationOutcome, {
    WorkoutDocumentExerciseSetSegmentInvalid: (
      workoutDocumentExerciseSetSegmentInvalid,
    ) => ({
      amount: getWholeNumberValidationErrorMessage(
        workoutDocumentExerciseSetSegmentInvalid.amount,
      ),
      weightValue: Match.valueTags(
        workoutDocumentExerciseSetSegmentInvalid.weightValue,
        {
          WeightValueOutOfRange: () =>
            workoutScreenMessages.weightValueOutOfRangeError({
              maximum: WEIGHT_VALUE_MAXIMUM,
              minimum: WEIGHT_VALUE_MINIMUM,
            }),
          WeightValueValid: () => undefined,
        },
      ),
    }),
    WorkoutDocumentExerciseSetSegmentValid: () => undefined,
  });
}
