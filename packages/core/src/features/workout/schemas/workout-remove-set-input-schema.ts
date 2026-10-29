import * as Schema from "effect/Schema";

import { idSchema } from "#/shared/schemas/id-schema.ts";

export type WorkoutRemoveSetInput = typeof workoutRemoveSetInputSchema.Type;

/**
 * The Workout exercise whose last Set `workout.removeSet` removes.
 */
export const workoutRemoveSetInputSchema = Schema.Struct({
  workoutExerciseId: idSchema,
});
