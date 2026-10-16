import * as Match from "effect/Match";

import type { RoutineDraftExerciseSetValidationOutcomes } from "@/features/routine/core/validate-routine-draft-exercise-set";
import type { WholeNumberValidationOutcome } from "@/shared/core/validate-whole-number";

import { routineEditorMessages } from "@/features/routine/messages/routine-editor-messages";
import { getWholeNumberValidationErrorMessage } from "@/shared/core/get-whole-number-validation-error-message";

export function getRoutineDraftExerciseSetValidationErrorMessages(
  routineDraftExerciseSetValidationOutcomes: RoutineDraftExerciseSetValidationOutcomes,
) {
  return {
    amount: getWholeNumberValidationErrorMessage(
      routineDraftExerciseSetValidationOutcomes.amount,
    ),
    dropSetSegmentCount: getOptionalWholeNumberValidationErrorMessage(
      routineDraftExerciseSetValidationOutcomes.dropSetSegmentCount,
    ),
    dropSetWeightPercentage: getOptionalWholeNumberValidationErrorMessage(
      routineDraftExerciseSetValidationOutcomes.dropSetWeightPercentage,
    ),
    restPauseRestSeconds: getOptionalWholeNumberValidationErrorMessage(
      routineDraftExerciseSetValidationOutcomes.restPauseRestSeconds,
    ),
    restPauseSegmentCount: getOptionalWholeNumberValidationErrorMessage(
      routineDraftExerciseSetValidationOutcomes.restPauseSegmentCount,
    ),
    restSeconds: getWholeNumberValidationErrorMessage(
      routineDraftExerciseSetValidationOutcomes.restSeconds,
    ),
    tempo: Match.valueTags(routineDraftExerciseSetValidationOutcomes.tempo, {
      TempoFormatInvalid: () => routineEditorMessages.tempoFormatInvalidError,
      TempoValid: () => undefined,
    }),
  };
}

function getOptionalWholeNumberValidationErrorMessage(
  wholeNumberValidationOutcome: undefined | WholeNumberValidationOutcome,
) {
  return wholeNumberValidationOutcome === undefined
    ? undefined
    : getWholeNumberValidationErrorMessage(wholeNumberValidationOutcome);
}
