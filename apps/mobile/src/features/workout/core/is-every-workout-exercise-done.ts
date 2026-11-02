import type { SetType } from "@ankaa/core/shared/constants/set-types";
import type { SkipReason } from "@ankaa/core/shared/constants/skip-reasons";

import { isWorkoutExerciseDone } from "@ankaa/core/features/workout/core/is-workout-exercise-done";

type WorkoutExercise = {
  plannedSets: readonly { type: SetType }[];
  recordedSets: readonly unknown[];
  skipReason: null | SkipReason;
};

/**
 * Tells whether a stop of the Workout with `sections` Skips none of its
 * Workout exercises, Warm-up exercises included, because each of them is
 * done.
 */
export function isEveryWorkoutExerciseDone({
  sections,
}: {
  sections: {
    coolDown: readonly { exercises: readonly WorkoutExercise[] }[];
    main: readonly {
      exercises: readonly (WorkoutExercise & {
        warmUpExercises: readonly WorkoutExercise[];
      })[];
    }[];
    warmUp: readonly { exercises: readonly WorkoutExercise[] }[];
  };
}) {
  return [
    ...sections.warmUp.flatMap((exerciseGroup) => exerciseGroup.exercises),
    ...sections.main.flatMap((exerciseGroup) =>
      exerciseGroup.exercises.flatMap((workoutExercise) => [
        workoutExercise,
        ...workoutExercise.warmUpExercises,
      ]),
    ),
    ...sections.coolDown.flatMap((exerciseGroup) => exerciseGroup.exercises),
  ].every((workoutExercise) =>
    isWorkoutExerciseDone({
      plannedSets: workoutExercise.plannedSets,
      recordedSetCount: workoutExercise.recordedSets.length,
      skipReason: workoutExercise.skipReason,
    }),
  );
}
