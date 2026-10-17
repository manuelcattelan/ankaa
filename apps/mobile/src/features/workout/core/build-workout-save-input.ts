import type { WorkoutSaveInput } from "@ankaa/core/features/workout/schemas/workout-save-input-schema";
import type { WeightType } from "@ankaa/core/shared/constants/weight-type";

import { AMOUNT_MINIMUM } from "@ankaa/core/shared/constants/amount";
import * as Match from "effect/Match";

import type {
  WorkoutDocument,
  WorkoutDocumentExerciseSetSegment,
} from "@/features/workout/core/workout-document-schema";

import { parseWeightValue } from "@/features/workout/core/parse-weight-value";
import { convertUndefinedToNull } from "@/shared/core/convert-undefined-to-null";
import { parseOptionalWholeNumber } from "@/shared/core/parse-optional-whole-number";
import { validateWholeNumber } from "@/shared/core/validate-whole-number";

type BuildWorkoutExerciseSetSegmentSaveInputOptions = {
  position: number;
  weightType: WeightType;
  workoutDocumentExerciseSetSegment: WorkoutDocumentExerciseSetSegment;
};

type WorkoutExerciseSetSegmentSaveInput =
  WorkoutSaveInput["exercises"][number]["sets"][number]["segments"][number];

export function buildWorkoutSaveInput(workoutDocument: WorkoutDocument) {
  return {
    endedAt: convertUndefinedToNull(workoutDocument.endedAt),
    exercises: workoutDocument.exercises.map(
      (workoutDocumentExercise, position) => ({
        amountUnit: workoutDocumentExercise.amountUnit,
        exerciseId: workoutDocumentExercise.exerciseId,
        id: workoutDocumentExercise.id,
        note: convertUndefinedToNull(
          workoutDocumentExercise.note.trim() || undefined,
        ),
        position,
        section: workoutDocumentExercise.section,
        sets: workoutDocumentExercise.sets.map(
          (workoutDocumentExerciseSet, setPosition) => ({
            id: workoutDocumentExerciseSet.id,
            isToFailure: workoutDocumentExerciseSet.isToFailure,
            position: setPosition,
            segments: workoutDocumentExerciseSet.segments.map(
              (workoutDocumentExerciseSetSegment, segmentPosition) =>
                buildWorkoutExerciseSetSegmentSaveInput({
                  position: segmentPosition,
                  weightType: workoutDocumentExercise.weightType,
                  workoutDocumentExerciseSetSegment,
                }),
            ),
            setType: workoutDocumentExerciseSet.setType,
            tempo: convertUndefinedToNull(workoutDocumentExerciseSet.tempo),
            variation: convertUndefinedToNull(
              workoutDocumentExerciseSet.variation,
            ),
          }),
        ),
        skipReason: convertUndefinedToNull(workoutDocumentExercise.skipReason),
        skipReasonNote: convertUndefinedToNull(
          workoutDocumentExercise.skipReason
            ? workoutDocumentExercise.skipReasonNote.trim() || undefined
            : undefined,
        ),
        superset: convertUndefinedToNull(workoutDocumentExercise.superset),
        warmUpForWorkoutExerciseId: convertUndefinedToNull(
          workoutDocumentExercise.warmUpForWorkoutExerciseId,
        ),
        weightType: workoutDocumentExercise.weightType,
      }),
    ),
    id: workoutDocument.id,
    routineId: workoutDocument.routineId,
    startedAt: workoutDocument.startedAt,
    version: workoutDocument.version,
  } satisfies WorkoutSaveInput;
}

function buildWorkoutExerciseSetSegmentSaveInput({
  position,
  weightType,
  workoutDocumentExerciseSetSegment,
}: BuildWorkoutExerciseSetSegmentSaveInputOptions) {
  const isWeightAllowed = weightType !== "none";
  const amountValidationOutcome = validateWholeNumber({
    isRequired: false,
    minimum: AMOUNT_MINIMUM,
    wholeNumberText: workoutDocumentExerciseSetSegment.amount,
  });

  return {
    amount: parseOptionalWholeNumber(
      Match.valueTags(amountValidationOutcome, {
        WholeNumberBelowMinimum: () => undefined,
        WholeNumberOutOfRange: () => undefined,
        WholeNumberValid: () => workoutDocumentExerciseSetSegment.amount,
      }),
    ),
    id: workoutDocumentExerciseSetSegment.id,
    position,
    weightUnit: convertUndefinedToNull(
      isWeightAllowed
        ? workoutDocumentExerciseSetSegment.weightUnit
        : undefined,
    ),
    weightValue: convertUndefinedToNull(
      isWeightAllowed
        ? parseWeightValue(workoutDocumentExerciseSetSegment.weightValue)
        : undefined,
    ),
  } satisfies WorkoutExerciseSetSegmentSaveInput;
}
