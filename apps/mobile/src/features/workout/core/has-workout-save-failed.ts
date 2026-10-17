import type { FailedWorkoutSave } from "@/features/workout/core/get-unsynced-workout-document";
import type { WorkoutDocument } from "@/features/workout/core/workout-document-schema";

import { hasWorkoutDocumentUnsavedChanges } from "@/features/workout/core/has-workout-document-unsaved-changes";

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
      hasWorkoutDocumentUnsavedChanges(workoutDocument) &&
      failedWorkoutSaves.some(
        (failedWorkoutSave) =>
          failedWorkoutSave.workoutId === workoutDocument.id,
      ),
  );
}
