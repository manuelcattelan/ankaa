import {
  WEIGHT_VALUE_MAXIMUM,
  WEIGHT_VALUE_MINIMUM,
} from "@ankaa/core/features/workout/constants/weight";
import { AMOUNT_MINIMUM } from "@ankaa/core/shared/constants/amount";
import { amountFilter } from "@ankaa/core/shared/filters/amount-filter";

import type { WorkoutDocumentExerciseSetSegment } from "@/features/workout/core/workout-document-schema";

import { parseWeightValue } from "@/features/workout/core/parse-weight-value";
import { workoutScreenMessages } from "@/features/workout/messages/workout-screen-messages";
import { getWholeNumberValidationError } from "@/shared/core/get-whole-number-validation-error";

export function getWorkoutDocumentExerciseSetSegmentValidationErrors(
  workoutDocumentExerciseSetSegment: WorkoutDocumentExerciseSetSegment,
) {
  const hasInvalidWeightValue =
    !!workoutDocumentExerciseSetSegment.weightValue.trim() &&
    parseWeightValue(workoutDocumentExerciseSetSegment.weightValue) ===
      undefined;

  return {
    amount: getWholeNumberValidationError({
      isRequired: false,
      minimum: AMOUNT_MINIMUM,
      wholeNumberFilter: amountFilter,
      wholeNumberText: workoutDocumentExerciseSetSegment.amount,
    }),
    weightValue: hasInvalidWeightValue
      ? workoutScreenMessages.weightValueRangeError({
          maximum: WEIGHT_VALUE_MAXIMUM,
          minimum: WEIGHT_VALUE_MINIMUM,
        })
      : undefined,
  };
}
