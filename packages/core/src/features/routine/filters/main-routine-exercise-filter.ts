import * as Schema from "effect/Schema";

/**
 * Checks that a Routine has a Routine exercise in its main Section, because a
 * Workout started from it would have nothing to record.
 */
export const mainRoutineExerciseFilter = Schema.makeFilter(
  (routine: {
    readonly sections: {
      readonly main: readonly { readonly exercises: readonly unknown[] }[];
    };
  }) =>
    routine.sections.main.some(
      (exerciseGroup) => exerciseGroup.exercises.length > 0,
    ),
  { expected: "a Routine exercise in the main Section" },
);
