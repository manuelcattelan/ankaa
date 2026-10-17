import * as Match from "effect/Match";

import type { RoutineNameValidationOutcome } from "@/features/routine/core/validate-routine-name";

import { routineEditorMessages } from "@/features/routine/messages/routine-editor-messages";

export function getRoutineNameValidationErrorMessage(
  routineNameValidationOutcome: RoutineNameValidationOutcome,
) {
  return Match.valueTags(routineNameValidationOutcome, {
    RoutineNameEmpty: () => routineEditorMessages.routineNameEmptyError,
    RoutineNameValid: () => undefined,
  });
}
