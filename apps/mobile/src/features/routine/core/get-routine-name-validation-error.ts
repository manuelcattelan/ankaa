import { routineNameFilter } from "@ankaa/core/features/routine/filters/routine-name-filter";
import * as Schema from "effect/Schema";

import { routineEditorMessages } from "@/features/routine/messages/routine-editor-messages";

export function getRoutineNameValidationError(routineName: string) {
  return Schema.is(Schema.String.check(routineNameFilter))(routineName.trim())
    ? undefined
    : routineEditorMessages.routineNameEmptyError;
}
