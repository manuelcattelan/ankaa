import * as Schema from "effect/Schema";

type SupersetExercise = {
  readonly position: number;
  readonly superset: null | number;
};

export const supersetNeighborsFilter = Schema.makeFilter(
  (exercises: readonly SupersetExercise[]) => {
    const sortedExercises = exercises.toSorted(
      (firstExercise, secondExercise) =>
        firstExercise.position - secondExercise.position,
    );

    return sortedExercises.flatMap((exercise, index) => {
      const isSupersetContinued =
        typeof exercise.superset !== "number" ||
        exercise.superset === sortedExercises[index - 1]?.superset;
      const isSupersetStartedEarlier = sortedExercises
        .slice(0, index)
        .some(
          (sortedExercise) => sortedExercise.superset === exercise.superset,
        );

      return !isSupersetContinued && isSupersetStartedEarlier
        ? ["The exercises of a superset must be neighbors"]
        : [];
    });
  },
);
