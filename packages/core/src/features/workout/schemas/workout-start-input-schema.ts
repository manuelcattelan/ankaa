import * as Schema from "effect/Schema";

import { idSchema } from "#/shared/schemas/id-schema.ts";

export type WorkoutStartInput = typeof workoutStartInputSchema.Type;

export const workoutStartInputSchema = Schema.Struct({
  id: idSchema,
  routineId: idSchema,
});
