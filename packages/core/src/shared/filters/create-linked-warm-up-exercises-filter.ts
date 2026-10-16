import * as Schema from "effect/Schema";

type CreateLinkedWarmUpExercisesFilterOptions<
  TWarmUpForExerciseIdKey extends string,
> = {
  warmUpForExerciseIdKey: TWarmUpForExerciseIdKey;
};

type LinkedWarmUpExercise<TWarmUpForExerciseIdKey extends string> = Readonly<
  Record<TWarmUpForExerciseIdKey, null | string>
> &
  SectionExercise;

type SectionExercise = {
  readonly id: string;
  readonly section: string;
};

export function createLinkedWarmUpExercisesFilter<
  TWarmUpForExerciseIdKey extends string,
>({
  warmUpForExerciseIdKey,
}: CreateLinkedWarmUpExercisesFilterOptions<TWarmUpForExerciseIdKey>) {
  return Schema.makeFilter(
    (exercises: readonly LinkedWarmUpExercise<TWarmUpForExerciseIdKey>[]) => {
      const exercisesById = new Map(
        exercises.map((exercise) => [exercise.id, exercise]),
      );

      return exercises.flatMap((exercise, index) => {
        const warmUpForExerciseId = exercise[warmUpForExerciseIdKey];
        const warmUpForExercise =
          typeof warmUpForExerciseId === "string"
            ? exercisesById.get(warmUpForExerciseId)
            : undefined;

        return typeof warmUpForExerciseId === "string" &&
          (warmUpForExercise?.section !== "main" ||
            warmUpForExercise.id === exercise.id)
          ? [
              {
                issue:
                  "Must point to another main exercise of the same routine or workout",
                path: [index, warmUpForExerciseIdKey],
              },
            ]
          : [];
      });
    },
  );
}
