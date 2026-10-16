import { AMOUNT_MINIMUM } from "@ankaa/core/shared/constants/amount";
import * as Data from "effect/Data";

import type { WorkoutDocumentExerciseSetSegment } from "@/features/workout/core/workout-document-schema";
import type { WholeNumberValidationOutcome } from "@/shared/core/validate-whole-number";

import { parseWeightValue } from "@/features/workout/core/parse-weight-value";
import { validateWholeNumber } from "@/shared/core/validate-whole-number";

export type WorkoutDocumentExerciseSetSegmentValidationOutcomes = {
  amount: WholeNumberValidationOutcome;
  weightValue: WeightValueValidationOutcome;
};

type WeightValueValidationOutcome = Data.TaggedEnum<{
  WeightValueOutOfRange: object;
  WeightValueValid: object;
}>;

const WeightValueValidationOutcome =
  Data.taggedEnum<WeightValueValidationOutcome>();

export function validateWorkoutDocumentExerciseSetSegment(
  workoutDocumentExerciseSetSegment: WorkoutDocumentExerciseSetSegment,
) {
  const workoutDocumentExerciseSetSegmentValidationOutcomes: WorkoutDocumentExerciseSetSegmentValidationOutcomes =
    {
      amount: validateWholeNumber({
        isRequired: false,
        minimum: AMOUNT_MINIMUM,
        wholeNumberText: workoutDocumentExerciseSetSegment.amount,
      }),
      weightValue: validateWeightValue(
        workoutDocumentExerciseSetSegment.weightValue,
      ),
    };

  return workoutDocumentExerciseSetSegmentValidationOutcomes;
}

function validateWeightValue(weightValueText: string) {
  return !weightValueText.trim() ||
    parseWeightValue(weightValueText) !== undefined
    ? WeightValueValidationOutcome.WeightValueValid()
    : WeightValueValidationOutcome.WeightValueOutOfRange();
}
