import * as Data from "effect/Data";

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

type WorkoutDocumentStorageChangesOutcome = Data.TaggedEnum<{
  StoredWorkoutDocumentJsonMalformed: { readonly cause: unknown };
  WorkoutDocumentStorageChangesFound: {
    readonly removedWorkoutIds: string[];
    readonly writtenWorkoutDocumentJsons: WrittenWorkoutDocumentJson[];
  };
}>;

type WrittenWorkoutDocumentJson = {
  workoutDocumentJson: string;
  workoutId: string;
};

const WorkoutDocumentStorageChangesOutcome =
  Data.taggedEnum<WorkoutDocumentStorageChangesOutcome>();

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
  const removedWorkoutIds: string[] = [];

  for (const storedWorkoutDocumentJson of storedWorkoutDocumentJsons) {
    if (workoutIds.has(storedWorkoutDocumentJson.workoutId)) {
      continue;
    }

    const storedWorkoutDocumentParseOutcome = parseStoredWorkoutDocument(
      storedWorkoutDocumentJson.workoutDocumentJson,
    );

    if (
      storedWorkoutDocumentParseOutcome._tag ===
      "StoredWorkoutDocumentJsonMalformed"
    ) {
      return WorkoutDocumentStorageChangesOutcome.StoredWorkoutDocumentJsonMalformed(
        { cause: storedWorkoutDocumentParseOutcome.cause },
      );
    }

    if (
      storedWorkoutDocumentParseOutcome._tag === "StoredWorkoutDocumentParsed"
    ) {
      removedWorkoutIds.push(storedWorkoutDocumentJson.workoutId);
    }
  }

  return WorkoutDocumentStorageChangesOutcome.WorkoutDocumentStorageChangesFound(
    {
      removedWorkoutIds,
      writtenWorkoutDocumentJsons: workoutDocuments.flatMap(
        (workoutDocument) => {
          const workoutDocumentJson = JSON.stringify(workoutDocument);

          return storedWorkoutDocumentJsonsByWorkoutId.get(
            workoutDocument.id,
          ) === workoutDocumentJson
            ? []
            : [{ workoutDocumentJson, workoutId: workoutDocument.id }];
        },
      ),
    },
  );
}
