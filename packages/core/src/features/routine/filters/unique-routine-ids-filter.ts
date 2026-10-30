import * as Schema from "effect/Schema";

type ExerciseGroupIds<TRoutineExerciseIds extends RoutineExerciseIds> = {
  readonly exercises: readonly TRoutineExerciseIds[];
  readonly id: string;
};

type RoutineExerciseIds = {
  readonly id: string;
  readonly sets: readonly { readonly id: string }[];
};

/**
 * Checks that no two nodes of a Routine's tree share an id, because each id
 * names one row that a Save writes.
 */
export const uniqueRoutineIdsFilter = Schema.makeFilter(
  (routine: {
    readonly id: string;
    readonly sections: {
      readonly coolDown: readonly ExerciseGroupIds<RoutineExerciseIds>[];
      readonly main: readonly ExerciseGroupIds<
        RoutineExerciseIds & {
          readonly warmUpExercises: readonly RoutineExerciseIds[];
        }
      >[];
      readonly warmUp: readonly ExerciseGroupIds<RoutineExerciseIds>[];
    };
  }) => {
    const ids = [
      routine.id,
      ...getExerciseGroupIds(routine.sections.warmUp),
      ...routine.sections.main.flatMap((exerciseGroup) => [
        exerciseGroup.id,
        ...exerciseGroup.exercises.flatMap((routineExercise) => [
          ...getRoutineExerciseIds(routineExercise),
          ...routineExercise.warmUpExercises.flatMap(getRoutineExerciseIds),
        ]),
      ]),
      ...getExerciseGroupIds(routine.sections.coolDown),
    ];

    return new Set(ids).size === ids.length;
  },
  { expected: "ids that are unique across the Routine" },
);

function getExerciseGroupIds(
  exerciseGroups: readonly ExerciseGroupIds<RoutineExerciseIds>[],
) {
  return exerciseGroups.flatMap((exerciseGroup) => [
    exerciseGroup.id,
    ...exerciseGroup.exercises.flatMap(getRoutineExerciseIds),
  ]);
}

function getRoutineExerciseIds(routineExercise: RoutineExerciseIds) {
  return [routineExercise.id, ...routineExercise.sets.map((set) => set.id)];
}
