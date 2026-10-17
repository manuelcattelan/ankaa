import { routineNameFilter } from "@ankaa/core/features/routine/filters/routine-name-filter";
import * as Data from "effect/Data";
import * as Schema from "effect/Schema";

export type RoutineNameValidationOutcome = Data.TaggedEnum<{
  RoutineNameEmpty: object;
  RoutineNameValid: object;
}>;

const RoutineNameValidationOutcome =
  Data.taggedEnum<RoutineNameValidationOutcome>();

export function validateRoutineName(routineName: string) {
  return Schema.is(Schema.String.check(routineNameFilter))(routineName.trim())
    ? RoutineNameValidationOutcome.RoutineNameValid()
    : RoutineNameValidationOutcome.RoutineNameEmpty();
}
