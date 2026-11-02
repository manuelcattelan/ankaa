import * as Schema from "effect/Schema";

import { SKIP_REASONS } from "#/features/workout/constants/skip-reasons.ts";
import { skipNoteFilter } from "#/features/workout/filters/skip-note-filter.ts";
import { idSchema } from "#/shared/schemas/id-schema.ts";

export type WorkoutSaveSkipInput = typeof workoutSaveSkipInputSchema.Type;

/**
 * The Skip that `workout.saveSkip` Saves on a Workout exercise: a reason with
 * an optional note, or no reason and no note to clear it.
 */
export const workoutSaveSkipInputSchema = Schema.Struct({
  note: Schema.NullOr(Schema.String),
  reason: Schema.NullOr(Schema.Literals(SKIP_REASONS)),
  workoutExerciseId: idSchema,
}).check(skipNoteFilter);
