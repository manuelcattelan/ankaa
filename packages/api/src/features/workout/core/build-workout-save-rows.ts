import type { WorkoutSaveInput } from "@ankaa/core/features/workout/schemas/workout-save-input-schema";

type BuildWorkoutSaveRowsOptions = {
  userId: string;
  workoutSaveInput: WorkoutSaveInput;
};

export function buildWorkoutSaveRows({
  userId,
  workoutSaveInput,
}: BuildWorkoutSaveRowsOptions) {
  const workoutExerciseSets = workoutSaveInput.exercises.flatMap(
    (workoutExercise) =>
      workoutExercise.sets.map((workoutExerciseSet) => ({
        ...workoutExerciseSet,
        workoutExerciseId: workoutExercise.id,
      })),
  );

  return {
    workoutExerciseRows: workoutSaveInput.exercises.map((workoutExercise) => ({
      amountUnit: workoutExercise.amountUnit,
      exerciseId: workoutExercise.exerciseId,
      id: workoutExercise.id,
      note: workoutExercise.note,
      position: workoutExercise.position,
      section: workoutExercise.section,
      skipReason: workoutExercise.skipReason,
      skipReasonNote: workoutExercise.skipReasonNote,
      superset: workoutExercise.superset,
      warmUpForWorkoutExerciseId: workoutExercise.warmUpForWorkoutExerciseId,
      weightType: workoutExercise.weightType,
      workoutId: workoutSaveInput.id,
    })),
    workoutExerciseSetRows: workoutExerciseSets.map((workoutExerciseSet) => ({
      id: workoutExerciseSet.id,
      isToFailure: workoutExerciseSet.isToFailure,
      position: workoutExerciseSet.position,
      setType: workoutExerciseSet.setType,
      tempo: workoutExerciseSet.tempo,
      variation: workoutExerciseSet.variation,
      workoutExerciseId: workoutExerciseSet.workoutExerciseId,
    })),
    workoutExerciseSetSegmentRows: workoutExerciseSets.flatMap(
      (workoutExerciseSet) =>
        workoutExerciseSet.segments.map((workoutExerciseSetSegment) => ({
          ...workoutExerciseSetSegment,
          workoutExerciseSetId: workoutExerciseSet.id,
        })),
    ),
    workoutRow: {
      endedAt:
        typeof workoutSaveInput.endedAt === "string"
          ? new Date(workoutSaveInput.endedAt)
          : workoutSaveInput.endedAt,
      id: workoutSaveInput.id,
      routineId: workoutSaveInput.routineId,
      startedAt: new Date(workoutSaveInput.startedAt),
      userId,
      version: workoutSaveInput.version,
    },
  };
}
