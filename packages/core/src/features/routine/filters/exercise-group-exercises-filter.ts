import * as Schema from "effect/Schema";

/**
 * Checks that an Exercise group holds at least one exercise.
 */
export const exerciseGroupExercisesFilter = Schema.isMinLength(1);
