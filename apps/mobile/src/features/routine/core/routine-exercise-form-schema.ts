import { workingSetFilter } from "@ankaa/core/features/routine/filters/working-set-filter";
import { idSchema } from "@ankaa/core/shared/schemas/id-schema";
import * as Schema from "effect/Schema";

import { routineExerciseSetFormSchema } from "#/features/routine/core/routine-exercise-set-form-schema.ts";
import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";
import { createNullableTextSchema } from "#/shared/core/create-nullable-text-schema.ts";

export const routineExerciseFormSchema = Schema.Struct({
  exerciseId: idSchema,
  id: idSchema,
  note: createNullableTextSchema(Schema.String),
  sets: Schema.Array(routineExerciseSetFormSchema),
}).check(
  workingSetFilter.annotate({
    message: ROUTINE_MESSAGES.workingSetMissingError,
  }),
);
