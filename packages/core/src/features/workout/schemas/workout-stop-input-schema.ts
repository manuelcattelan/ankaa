import * as Schema from "effect/Schema";

import { skipNoteFilter } from "#/features/workout/filters/skip-note-filter.ts";
import { SKIP_REASONS } from "#/shared/constants/skip-reasons.ts";
import { idSchema } from "#/shared/schemas/id-schema.ts";

export type WorkoutStopInput = typeof workoutStopInputSchema.Type;

/**
 * The stop of a Workout, with the reason and the optional note of the Skip
 * that it gives every Workout exercise that isn't done, or no reason and no
 * note when every Workout exercise is done.
 */
export const workoutStopInputSchema = Schema.Struct({
  id: idSchema,
  note: Schema.NullOr(Schema.String),
  reason: Schema.NullOr(Schema.Literals(SKIP_REASONS)),
}).check(skipNoteFilter);
