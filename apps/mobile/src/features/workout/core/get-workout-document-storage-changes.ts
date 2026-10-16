import type { WorkoutDocument } from "@/features/workout/core/workout-document-schema";

import { parseStoredWorkoutDocument } from "@/features/workout/core/parse-stored-workout-document";

type GetWorkoutDocumentStorageChangesOptions = {
  storedWorkoutDocumentJsons: StoredWorkoutDocumentJson[];
  workoutDocuments: WorkoutDocument[];
};

type StoredWorkoutDocumentJson = {
  workoutDocumentJson: null | string;
  workoutId: string;
};

export function getWorkoutDocumentStorageChanges({
  storedWorkoutDocumentJsons,
  workoutDocuments,
}: GetWorkoutDocumentStorageChangesOptions) {
  const storedWorkoutDocumentJsonsByWorkoutId = new Map(
    storedWorkoutDocumentJsons.map(
      (storedWorkoutDocumentJson) =>
        [
          storedWorkoutDocumentJson.workoutId,
          storedWorkoutDocumentJson.workoutDocumentJson,
        ] as const,
    ),
  );
  const workoutIds = new Set(
    workoutDocuments.map((workoutDocument) => workoutDocument.id),
  );

  return {
    removedWorkoutIds: storedWorkoutDocumentJsons
      .filter(
        (storedWorkoutDocumentJson) =>
          !workoutIds.has(storedWorkoutDocumentJson.workoutId) &&
          parseStoredWorkoutDocument(
            storedWorkoutDocumentJson.workoutDocumentJson,
          ),
      )
      .map((storedWorkoutDocumentJson) => storedWorkoutDocumentJson.workoutId),
    writtenWorkoutDocumentJsons: workoutDocuments.flatMap((workoutDocument) => {
      const workoutDocumentJson = JSON.stringify(workoutDocument);

      return storedWorkoutDocumentJsonsByWorkoutId.get(workoutDocument.id) ===
        workoutDocumentJson
        ? []
        : [{ workoutDocumentJson, workoutId: workoutDocument.id }];
    }),
  };
}
