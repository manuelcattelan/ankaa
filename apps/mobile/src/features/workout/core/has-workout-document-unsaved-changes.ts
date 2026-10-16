import type { WorkoutDocument } from "@/features/workout/core/workout-document-schema";

export function hasWorkoutDocumentUnsavedChanges(
  workoutDocument: WorkoutDocument,
) {
  return workoutDocument.version > workoutDocument.syncedVersion;
}
