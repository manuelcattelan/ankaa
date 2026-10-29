import * as Schema from "effect/Schema";

import { idSchema } from "#/shared/schemas/id-schema.ts";

export type WorkoutSaveNoteInput = typeof workoutSaveNoteInputSchema.Type;

/**
 * The note that `workout.saveNote` Saves on a Workout exercise, or `null` to
 * clear it.
 */
export const workoutSaveNoteInputSchema = Schema.Struct({
  note: Schema.NullOr(Schema.String),
  workoutExerciseId: idSchema,
});
