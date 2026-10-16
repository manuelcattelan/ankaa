import type { RoutineSaveInput } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";

type BuildRoutineSaveRowsOptions = {
  routineSaveInput: RoutineSaveInput;
};

export function buildRoutineSaveRows({
  routineSaveInput,
}: BuildRoutineSaveRowsOptions) {
  return {
    routineDayRows: routineSaveInput.days.map((dayOfWeek) => ({
      dayOfWeek,
      routineId: routineSaveInput.id,
    })),
    routineExerciseRows: routineSaveInput.exercises.map((routineExercise) => ({
      exerciseId: routineExercise.exerciseId,
      id: routineExercise.id,
      note: routineExercise.note,
      position: routineExercise.position,
      routineId: routineSaveInput.id,
      section: routineExercise.section,
      superset: routineExercise.superset,
      warmUpForRoutineExerciseId: routineExercise.warmUpForRoutineExerciseId,
    })),
    routineExerciseSetRows: routineSaveInput.exercises.flatMap(
      (routineExercise) =>
        routineExercise.sets.map((routineExerciseSet) => ({
          ...routineExerciseSet,
          routineExerciseId: routineExercise.id,
        })),
    ),
  };
}
