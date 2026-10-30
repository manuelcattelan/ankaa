import * as Schema from "effect/Schema";

import { DAYS_OF_WEEK } from "#/features/routine/constants/days-of-week.ts";
import { dropSetWeightPercentageFilter } from "#/features/routine/filters/drop-set-weight-percentage-filter.ts";
import { exerciseGroupExercisesFilter } from "#/features/routine/filters/exercise-group-exercises-filter.ts";
import { mainRoutineExerciseFilter } from "#/features/routine/filters/main-routine-exercise-filter.ts";
import { pauseSecondsFilter } from "#/features/routine/filters/pause-seconds-filter.ts";
import { restSecondsFilter } from "#/features/routine/filters/rest-seconds-filter.ts";
import { routineNameFilter } from "#/features/routine/filters/routine-name-filter.ts";
import { segmentCountFilter } from "#/features/routine/filters/segment-count-filter.ts";
import { uniqueDaysFilter } from "#/features/routine/filters/unique-days-filter.ts";
import { uniqueRoutineIdsFilter } from "#/features/routine/filters/unique-routine-ids-filter.ts";
import { SET_TYPES } from "#/shared/constants/set-types.ts";
import { amountFilter } from "#/shared/filters/amount-filter.ts";
import { tempoFilter } from "#/shared/filters/tempo-filter.ts";
import { idSchema } from "#/shared/schemas/id-schema.ts";
import { integerSchema } from "#/shared/schemas/integer-schema.ts";

export type RoutineSaveInput = typeof routineSaveInputSchema.Type;

const dropSetSchema = Schema.TaggedStruct("DropSet", {
  segmentCount: integerSchema.check(segmentCountFilter),
  weightPercentage: Schema.NullOr(
    integerSchema.check(dropSetWeightPercentageFilter),
  ),
});

const restPauseSetSchema = Schema.TaggedStruct("RestPauseSet", {
  pauseSeconds: integerSchema.check(pauseSecondsFilter),
  segmentCount: integerSchema.check(segmentCountFilter),
});

const routineExerciseSetSchema = Schema.Struct({
  amount: Schema.NullOr(integerSchema.check(amountFilter)),
  id: idSchema,
  intensityTechnique: Schema.NullOr(
    Schema.Union([dropSetSchema, restPauseSetSchema]),
  ),
  isToFailure: Schema.Boolean,
  restSeconds: Schema.NullOr(integerSchema.check(restSecondsFilter)),
  tempo: Schema.NullOr(Schema.String.check(tempoFilter)),
  type: Schema.Literals(SET_TYPES),
});

const routineExerciseSchema = Schema.Struct({
  exerciseId: idSchema,
  id: idSchema,
  note: Schema.NullOr(Schema.String),
  sets: Schema.Array(routineExerciseSetSchema),
});

const mainRoutineExerciseSchema = Schema.Struct({
  ...routineExerciseSchema.fields,
  warmUpExercises: Schema.Array(routineExerciseSchema),
});

const exerciseGroupSchema = Schema.Struct({
  exercises: Schema.Array(routineExerciseSchema).check(
    exerciseGroupExercisesFilter,
  ),
  id: idSchema,
});

const mainExerciseGroupSchema = Schema.Struct({
  exercises: Schema.Array(mainRoutineExerciseSchema).check(
    exerciseGroupExercisesFilter,
  ),
  id: idSchema,
});

/**
 * The tree of a Routine that `routine.save` takes, with every rule that
 * holds within one Routine.
 */
export const routineSaveInputSchema = Schema.Struct({
  days: Schema.Array(Schema.Literals(DAYS_OF_WEEK)).check(uniqueDaysFilter),
  id: idSchema,
  name: Schema.Trim.check(routineNameFilter),
  sections: Schema.Struct({
    coolDown: Schema.Array(exerciseGroupSchema),
    main: Schema.Array(mainExerciseGroupSchema),
    warmUp: Schema.Array(exerciseGroupSchema),
  }),
}).check(mainRoutineExerciseFilter, uniqueRoutineIdsFilter);
