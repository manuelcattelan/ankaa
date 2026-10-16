import type { WorkoutDocument } from "@/features/workout/core/workout-document-schema";

import { hasWorkoutDocumentUnsavedChanges } from "@/features/workout/core/has-workout-document-unsaved-changes";

export type FailedWorkoutSave = {
  version: number;
  workoutId: string;
};

type GetUnsyncedWorkoutDocumentOptions = {
  failedWorkoutSaves: FailedWorkoutSave[];
  workoutDocuments: WorkoutDocument[];
};

type HasFailedWorkoutSaveOptions = {
  failedWorkoutSaves: FailedWorkoutSave[];
  workoutDocument: WorkoutDocument;
};

export function getUnsyncedWorkoutDocument({
  failedWorkoutSaves,
  workoutDocuments,
}: GetUnsyncedWorkoutDocumentOptions) {
  const unsyncedWorkoutDocuments = workoutDocuments.filter(
    (workoutDocument) =>
      hasWorkoutDocumentUnsavedChanges(workoutDocument) &&
      !hasFailedWorkoutSave({ failedWorkoutSaves, workoutDocument }),
  );

  const oldestEndedWorkoutDocument = unsyncedWorkoutDocuments.reduce<
    undefined | WorkoutDocument
  >(
    (olderEndedWorkoutDocument, unsyncedWorkoutDocument) =>
      unsyncedWorkoutDocument.endedAt !== undefined &&
      (olderEndedWorkoutDocument?.endedAt === undefined ||
        unsyncedWorkoutDocument.endedAt < olderEndedWorkoutDocument.endedAt)
        ? unsyncedWorkoutDocument
        : olderEndedWorkoutDocument,
    undefined,
  );

  return (
    oldestEndedWorkoutDocument ??
    unsyncedWorkoutDocuments.find(
      (unsyncedWorkoutDocument) =>
        unsyncedWorkoutDocument.endedAt === undefined,
    )
  );
}

function hasFailedWorkoutSave({
  failedWorkoutSaves,
  workoutDocument,
}: HasFailedWorkoutSaveOptions) {
  return failedWorkoutSaves.some(
    (failedWorkoutSave) =>
      failedWorkoutSave.workoutId === workoutDocument.id &&
      failedWorkoutSave.version === workoutDocument.version,
  );
}
