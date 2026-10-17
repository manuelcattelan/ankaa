import type { Routine } from "@/shared/interactors/list-routines";

type CanStartWorkoutOptions = {
  exerciseNames: Map<string, string>;
  routine: Routine;
};

export function canStartWorkout({
  exerciseNames,
  routine,
}: CanStartWorkoutOptions) {
  return (
    exerciseNames.size > 0 &&
    routine.exercises.every((routineExercise) =>
      exerciseNames.has(routineExercise.exerciseId),
    )
  );
}
