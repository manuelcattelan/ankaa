import * as Schema from "effect/Schema";

import { idSchema } from "#/shared/schemas/id-schema.ts";

export type WorkoutStopInput = typeof workoutStopInputSchema.Type;

export const workoutStopInputSchema = Schema.Struct({ id: idSchema });
