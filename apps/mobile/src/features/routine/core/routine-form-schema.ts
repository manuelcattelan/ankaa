import { DAYS_OF_WEEK } from "@ankaa/core/features/routine/constants/days-of-week";
import { exerciseGroupExercisesFilter } from "@ankaa/core/features/routine/filters/exercise-group-exercises-filter";
import { mainRoutineExerciseFilter } from "@ankaa/core/features/routine/filters/main-routine-exercise-filter";
import { routineNameFilter } from "@ankaa/core/features/routine/filters/routine-name-filter";
import { uniqueDaysFilter } from "@ankaa/core/features/routine/filters/unique-days-filter";
import { uniqueRoutineIdsFilter } from "@ankaa/core/features/routine/filters/unique-routine-ids-filter";
import { idSchema } from "@ankaa/core/shared/schemas/id-schema";
import * as Schema from "effect/Schema";

import { routineExerciseSetFormSchema } from "#/features/routine/core/routine-exercise-set-form-schema.ts";
import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";
import { createNullableTextSchema } from "#/shared/core/create-nullable-text-schema.ts";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

export type RoutineDraft = typeof routineFormSchema.Encoded;

const routineExerciseFormSchema = Schema.Struct({
  exerciseId: idSchema,
  id: idSchema,
  note: createNullableTextSchema(Schema.String),
  sets: Schema.Array(routineExerciseSetFormSchema),
});

const mainRoutineExerciseFormSchema = Schema.Struct({
  ...routineExerciseFormSchema.fields,
  warmUpExercises: Schema.Array(routineExerciseFormSchema),
});

// Only a bug can leave an Exercise group empty or repeat an id, because the
// editor creates both, so the User can only try again
// (https://github.com/manuelcattelan/ankaa/issues/108).
const exerciseGroupFormSchema = Schema.Struct({
  exercises: Schema.Array(routineExerciseFormSchema).check(
    exerciseGroupExercisesFilter.annotate({
      message: SHARED_MESSAGES.unknownError,
    }),
  ),
  id: idSchema,
});

const mainExerciseGroupFormSchema = Schema.Struct({
  exercises: Schema.Array(mainRoutineExerciseFormSchema).check(
    exerciseGroupExercisesFilter.annotate({
      message: SHARED_MESSAGES.unknownError,
    }),
  ),
  id: idSchema,
});

/**
 * The Routine form Schema: the shape of `routine.save`'s wire Schema, built
 * from the same Filters with the text of the editor's fields, so its Encoded
 * side is the Draft and decoding the Draft checks every rule the server
 * checks.
 */
export const routineFormSchema = Schema.Struct({
  days: Schema.Array(Schema.Literals(DAYS_OF_WEEK)).check(
    uniqueDaysFilter.annotate({ message: SHARED_MESSAGES.unknownError }),
  ),
  id: idSchema,
  name: Schema.Trim.check(
    routineNameFilter.annotate({
      message: ROUTINE_MESSAGES.routineNameEmptyError,
    }),
  ),
  sections: Schema.Struct({
    coolDown: Schema.Array(exerciseGroupFormSchema),
    main: Schema.Array(mainExerciseGroupFormSchema),
    warmUp: Schema.Array(exerciseGroupFormSchema),
  }),
}).check(
  mainRoutineExerciseFilter.annotate({
    message: ROUTINE_MESSAGES.mainRoutineExerciseMissingError,
  }),
  uniqueRoutineIdsFilter.annotate({ message: SHARED_MESSAGES.unknownError }),
);
