import type { Routine } from "@/shared/interactors/list-routines";

type CanStartWorkoutOptions = {
  exerciseIds: Set<string>;
  routine: Routine;
};

export function canStartWorkout({
  exerciseIds,
  routine,
}: CanStartWorkoutOptions) {
  return (
    exerciseIds.size > 0 &&
    routine.exercises.every((routineExercise) =>
      exerciseIds.has(routineExercise.exerciseId),
    )
  );
}
