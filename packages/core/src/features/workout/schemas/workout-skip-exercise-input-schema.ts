import * as Schema from "effect/Schema";

import { SKIP_REASONS } from "#/features/workout/constants/skip-reasons.ts";
import { skipNoteFilter } from "#/features/workout/filters/skip-note-filter.ts";
import { idSchema } from "#/shared/schemas/id-schema.ts";

export type WorkoutSkipExerciseInput =
  typeof workoutSkipExerciseInputSchema.Type;

/**
 * The skip that `workout.skipExercise` Saves on a Workout exercise: a reason
 * with an optional note, or no reason and no note for a Workout exercise that
 * isn't skipped.
 */
export const workoutSkipExerciseInputSchema = Schema.Struct({
  note: Schema.NullOr(Schema.String),
  reason: Schema.NullOr(Schema.Literals(SKIP_REASONS)),
  workoutExerciseId: idSchema,
}).check(skipNoteFilter);
