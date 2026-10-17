import { AMOUNT_MINIMUM } from "@ankaa/core/shared/constants/amount";
import * as Data from "effect/Data";
import * as Match from "effect/Match";

import type { WorkoutDocumentExerciseSetSegment } from "@/features/workout/core/workout-document-schema";
import type { WholeNumberValidationOutcome } from "@/shared/core/validate-whole-number";

import { parseWeightValue } from "@/features/workout/core/parse-weight-value";
import { isWholeNumberValid } from "@/shared/core/is-whole-number-valid";
import { validateWholeNumber } from "@/shared/core/validate-whole-number";

export type WorkoutDocumentExerciseSetSegmentValidationOutcome =
  Data.TaggedEnum<{
    WorkoutDocumentExerciseSetSegmentInvalid: WorkoutDocumentExerciseSetSegmentFieldValidationOutcomes;
    WorkoutDocumentExerciseSetSegmentValid: object;
  }>;

type WeightValueValidationOutcome = Data.TaggedEnum<{
  WeightValueOutOfRange: object;
  WeightValueValid: object;
}>;

type WorkoutDocumentExerciseSetSegmentFieldValidationOutcomes = {
  readonly amount: WholeNumberValidationOutcome;
  readonly weightValue: WeightValueValidationOutcome;
};

const WeightValueValidationOutcome =
  Data.taggedEnum<WeightValueValidationOutcome>();

const WorkoutDocumentExerciseSetSegmentValidationOutcome =
  Data.taggedEnum<WorkoutDocumentExerciseSetSegmentValidationOutcome>();

export function validateWorkoutDocumentExerciseSetSegment(
  workoutDocumentExerciseSetSegment: WorkoutDocumentExerciseSetSegment,
) {
  const workoutDocumentExerciseSetSegmentFieldValidationOutcomes: WorkoutDocumentExerciseSetSegmentFieldValidationOutcomes =
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

  const isWorkoutDocumentExerciseSetSegmentValid =
    isWholeNumberValid(
      workoutDocumentExerciseSetSegmentFieldValidationOutcomes.amount,
    ) &&
    Match.valueTags(
      workoutDocumentExerciseSetSegmentFieldValidationOutcomes.weightValue,
      {
        WeightValueOutOfRange: () => false,
        WeightValueValid: () => true,
      },
    );

  return isWorkoutDocumentExerciseSetSegmentValid
    ? WorkoutDocumentExerciseSetSegmentValidationOutcome.WorkoutDocumentExerciseSetSegmentValid()
    : WorkoutDocumentExerciseSetSegmentValidationOutcome.WorkoutDocumentExerciseSetSegmentInvalid(
        workoutDocumentExerciseSetSegmentFieldValidationOutcomes,
      );
}

function validateWeightValue(weightValueText: string) {
  return !weightValueText.trim() ||
    parseWeightValue(weightValueText) !== undefined
    ? WeightValueValidationOutcome.WeightValueValid()
    : WeightValueValidationOutcome.WeightValueOutOfRange();
}
