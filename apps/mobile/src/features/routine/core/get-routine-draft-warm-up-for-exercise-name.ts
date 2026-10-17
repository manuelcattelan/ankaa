import type {
  RoutineDraftBlock,
  RoutineDraftWarmUpExercise,
} from "@/features/routine/core/routine-draft-reducer";

type GetRoutineDraftWarmUpForExerciseNameOptions = {
  exerciseNames: Map<string, string>;
  routineDraftBlock: RoutineDraftBlock;
  routineDraftWarmUpExercise: RoutineDraftWarmUpExercise;
};

export function getRoutineDraftWarmUpForExerciseName({
  exerciseNames,
  routineDraftBlock,
  routineDraftWarmUpExercise,
}: GetRoutineDraftWarmUpForExerciseNameOptions) {
  const warmUpForRoutineDraftExercise = routineDraftBlock.exercises.find(
    (routineDraftExercise) =>
      routineDraftExercise.id ===
      routineDraftWarmUpExercise.warmUpForRoutineExerciseId,
  );

  return (
    exerciseNames.get(warmUpForRoutineDraftExercise?.exerciseId ?? "") ?? ""
  );
}
