import type { Section } from "@ankaa/core/shared/constants/sections";

/**
 * Where the exercise that the User picks goes: a new Exercise group at the
 * end of a Section, or a new Warm-up exercise of a main Section's Routine
 * exercise.
 */
export type ExercisePickerTarget =
  { section: Section } | { warmUpForRoutineExerciseId: string };
