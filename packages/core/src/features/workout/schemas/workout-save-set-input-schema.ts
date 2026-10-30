import * as Schema from "effect/Schema";

import { WEIGHT_UNITS } from "#/features/workout/constants/weight.ts";
import { weightFilter } from "#/features/workout/filters/weight-filter.ts";
import { weightStepFilter } from "#/features/workout/filters/weight-step-filter.ts";
import { amountFilter } from "#/shared/filters/amount-filter.ts";
import { idSchema } from "#/shared/schemas/id-schema.ts";
import { integerSchema } from "#/shared/schemas/integer-schema.ts";

export type WorkoutSaveSetInput = typeof workoutSaveSetInputSchema.Type;

/**
 * The Set that `workout.saveSet` upserts by its `id` into a Workout exercise,
 * with its Segments in order and the Weight unit of the Workout exercise.
 */
export const workoutSaveSetInputSchema = Schema.Struct({
  id: idSchema,
  segments: Schema.Array(
    Schema.Struct({
      amount: integerSchema.check(amountFilter),
      weight: Schema.NullOr(
        Schema.Number.check(weightFilter, weightStepFilter),
      ),
    }),
  ),
  weightUnit: Schema.Literals(WEIGHT_UNITS),
  workoutExerciseId: idSchema,
});
