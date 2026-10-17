import type { WorkoutDocumentExercise } from "@/features/workout/core/workout-document-schema";

export function getWorkoutDocumentExerciseWorkingSetCounts(
  workoutDocumentExercise: WorkoutDocumentExercise,
) {
  const workingSetDoneCount = workoutDocumentExercise.sets.filter(
    (workoutDocumentExerciseSet) =>
      workoutDocumentExerciseSet.setType === "working",
  ).length;
  const workingSetPlannedCount =
    workoutDocumentExercise.routineExerciseSets.filter(
      (workoutDocumentRoutineExerciseSet) =>
        workoutDocumentRoutineExerciseSet.setType === "working",
    ).length;

  return {
    workingSetDoneCount,
    workingSetLeftCount: Math.max(
      0,
      workingSetPlannedCount - workingSetDoneCount,
    ),
  };
}
