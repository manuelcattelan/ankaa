import type { FailedWorkoutSave } from "@/features/workout/core/get-unsynced-workout-document";
import type { WorkoutDocument } from "@/features/workout/core/workout-document-schema";

type HasWorkoutSaveFailedOptions = {
  failedWorkoutSaves: FailedWorkoutSave[];
  workoutDocuments: WorkoutDocument[];
};

export function hasWorkoutSaveFailed({
  failedWorkoutSaves,
  workoutDocuments,
}: HasWorkoutSaveFailedOptions) {
  return workoutDocuments.some(
    (workoutDocument) =>
      workoutDocument.version > workoutDocument.syncedVersion &&
      failedWorkoutSaves.some(
        (failedWorkoutSave) =>
          failedWorkoutSave.workoutId === workoutDocument.id,
      ),
  );
}
