import type { Section } from "@ankaa/core/shared/constants/sections";

/**
 * Builds the Sections of a Routine's or a Workout's tree from its Exercise
 * group rows, which carry their Section, with each exercise built by
 * `buildExercise` and each main Section exercise's Warm-up exercises under
 * it.
 */
export function buildSections<TExerciseRow, TExercise extends object>({
  buildExercise,
  exerciseGroups,
}: {
  buildExercise: (exerciseRow: TExerciseRow) => TExercise;
  exerciseGroups: readonly {
    exercises: readonly (TExerciseRow & {
      warmUpExercises: readonly TExerciseRow[];
    })[];
    id: string;
    section: Section;
  }[];
}) {
  function getSectionExerciseGroups(section: Section) {
    return exerciseGroups.filter(
      (exerciseGroup) => exerciseGroup.section === section,
    );
  }

  return {
    coolDown: getSectionExerciseGroups("cool_down").map((exerciseGroup) => ({
      exercises: exerciseGroup.exercises.map((exerciseRow) =>
        buildExercise(exerciseRow),
      ),
      id: exerciseGroup.id,
    })),
    main: getSectionExerciseGroups("main").map((exerciseGroup) => ({
      exercises: exerciseGroup.exercises.map((mainExerciseRow) => ({
        ...buildExercise(mainExerciseRow),
        warmUpExercises: mainExerciseRow.warmUpExercises.map(
          (warmUpExerciseRow) => buildExercise(warmUpExerciseRow),
        ),
      })),
      id: exerciseGroup.id,
    })),
    warmUp: getSectionExerciseGroups("warm_up").map((exerciseGroup) => ({
      exercises: exerciseGroup.exercises.map((exerciseRow) =>
        buildExercise(exerciseRow),
      ),
      id: exerciseGroup.id,
    })),
  };
}
