import * as Schema from "effect/Schema";

import { idSchema } from "#/shared/schemas/id-schema.ts";

export type WorkoutRemoveSetInput = typeof workoutRemoveSetInputSchema.Type;

/**
 * The recorded Set that `workout.removeSet` removes, with the Workout
 * exercise that records it.
 */
export const workoutRemoveSetInputSchema = Schema.Struct({
  id: idSchema,
  workoutExerciseId: idSchema,
});
