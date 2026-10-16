import type { Exercise } from "@/shared/interactors/list-exercises";

export function getExerciseNames(exercises: Exercise[] | undefined) {
  return new Map(
    exercises?.map((exercise) => [exercise.id, exercise.name] as const),
  );
}
