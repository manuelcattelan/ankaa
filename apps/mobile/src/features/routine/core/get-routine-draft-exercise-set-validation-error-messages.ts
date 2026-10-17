import * as Match from "effect/Match";

import type { RoutineDraftExerciseSetValidationOutcome } from "@/features/routine/core/validate-routine-draft-exercise-set";
import type { WholeNumberValidationOutcome } from "@/shared/core/validate-whole-number";

import { routineEditorMessages } from "@/features/routine/messages/routine-editor-messages";
import { getWholeNumberValidationErrorMessage } from "@/shared/core/get-whole-number-validation-error-message";

export function getRoutineDraftExerciseSetValidationErrorMessages(
  routineDraftExerciseSetValidationOutcome: RoutineDraftExerciseSetValidationOutcome,
) {
  return Match.valueTags(routineDraftExerciseSetValidationOutcome, {
    RoutineDraftExerciseSetInvalid: (routineDraftExerciseSetInvalid) => ({
      amount: getWholeNumberValidationErrorMessage(
        routineDraftExerciseSetInvalid.amount,
      ),
      dropSetSegmentCount: getOptionalWholeNumberValidationErrorMessage(
        routineDraftExerciseSetInvalid.dropSetSegmentCount,
      ),
      dropSetWeightPercentage: getOptionalWholeNumberValidationErrorMessage(
        routineDraftExerciseSetInvalid.dropSetWeightPercentage,
      ),
      restPauseRestSeconds: getOptionalWholeNumberValidationErrorMessage(
        routineDraftExerciseSetInvalid.restPauseRestSeconds,
      ),
      restPauseSegmentCount: getOptionalWholeNumberValidationErrorMessage(
        routineDraftExerciseSetInvalid.restPauseSegmentCount,
      ),
      restSeconds: getWholeNumberValidationErrorMessage(
        routineDraftExerciseSetInvalid.restSeconds,
      ),
      tempo: Match.valueTags(routineDraftExerciseSetInvalid.tempo, {
        TempoFormatInvalid: () => routineEditorMessages.tempoFormatInvalidError,
        TempoValid: () => undefined,
      }),
    }),
    RoutineDraftExerciseSetValid: () => undefined,
  });
}

function getOptionalWholeNumberValidationErrorMessage(
  wholeNumberValidationOutcome: undefined | WholeNumberValidationOutcome,
) {
  return wholeNumberValidationOutcome === undefined
    ? undefined
    : getWholeNumberValidationErrorMessage(wholeNumberValidationOutcome);
}
