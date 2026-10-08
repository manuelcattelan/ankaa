import type { z } from "zod";

type CheckLinkedWarmUpExercisesOptions<TWarmUpForExerciseIdKey extends string> =
  {
    context: z.RefinementCtx;
    exercises: LinkedWarmUpExercise<TWarmUpForExerciseIdKey>[];
    warmUpForExerciseIdKey: TWarmUpForExerciseIdKey;
  };

type CheckSupersetNeighborsOptions = {
  context: z.RefinementCtx;
  exercises: SupersetExercise[];
};

type CheckUniqueValuesOptions = {
  context: z.RefinementCtx;
  values: unknown[];
};

type LinkedWarmUpExercise<TWarmUpForExerciseIdKey extends string> = Record<
  TWarmUpForExerciseIdKey,
  null | string
> &
  SectionExercise;

type SectionExercise = {
  id: string;
  section: string;
};

type SupersetExercise = {
  position: number;
  superset: null | number;
};

export function checkLinkedWarmUpExercises<
  TWarmUpForExerciseIdKey extends string,
>({
  context,
  exercises,
  warmUpForExerciseIdKey,
}: CheckLinkedWarmUpExercisesOptions<TWarmUpForExerciseIdKey>) {
  for (const [index, exercise] of exercises.entries()) {
    const warmUpForExerciseId = exercise[warmUpForExerciseIdKey];
    const warmUpForExercise = exercises.find(
      (linkedExercise) => linkedExercise.id === warmUpForExerciseId,
    );

    if (
      typeof warmUpForExerciseId === "string" &&
      (warmUpForExercise?.section !== "main" ||
        warmUpForExercise.id === exercise.id)
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Must point to another main exercise of the same routine or workout",
        path: [index, warmUpForExerciseIdKey],
      });
    }
  }
}

export function checkSupersetNeighbors({
  context,
  exercises,
}: CheckSupersetNeighborsOptions) {
  const sortedExercises = exercises.toSorted(
    (firstExercise, secondExercise) =>
      firstExercise.position - secondExercise.position,
  );

  for (const [index, exercise] of sortedExercises.entries()) {
    const isSupersetContinued =
      typeof exercise.superset !== "number" ||
      exercise.superset === sortedExercises[index - 1]?.superset;
    const isSupersetStartedEarlier = sortedExercises
      .slice(0, index)
      .some(
        (earlierExercise) => earlierExercise.superset === exercise.superset,
      );

    if (!isSupersetContinued && isSupersetStartedEarlier) {
      context.addIssue({
        code: "custom",
        message: "The exercises of a superset must be neighbors",
      });
    }
  }
}

export function checkUniqueValues({
  context,
  values,
}: CheckUniqueValuesOptions) {
  if (new Set(values).size !== values.length) {
    context.addIssue({ code: "custom", message: "Must be unique" });
  }
}
