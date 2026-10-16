import * as Effect from "effect/Effect";
import * as Match from "effect/Match";

import type { WorkoutDocument } from "@/features/workout/core/workout-document-schema";

import { getWorkoutDocumentStorageChanges } from "@/features/workout/core/get-workout-document-storage-changes";
import { WorkoutDocumentStorage } from "@/features/workout/services/workout-document-storage";

export const writeWorkoutDocuments = Effect.fn("writeWorkoutDocuments")(
  function* (workoutDocuments: WorkoutDocument[]) {
    const workoutDocumentStorage = yield* WorkoutDocumentStorage;

    const storedWorkoutDocumentJsons =
      yield* workoutDocumentStorage.readStoredWorkoutDocumentJsons();

    const workoutDocumentStorageChangesOutcome =
      getWorkoutDocumentStorageChanges({
        storedWorkoutDocumentJsons,
        workoutDocuments,
      });

    yield* Match.valueTags(workoutDocumentStorageChangesOutcome, {
      StoredWorkoutDocumentJsonMalformed: (
        storedWorkoutDocumentJsonMalformed,
      ) => Effect.die(storedWorkoutDocumentJsonMalformed.cause),
      WorkoutDocumentStorageChangesFound: (workoutDocumentStorageChanges) =>
        Effect.gen(function* () {
          yield* Effect.forEach(
            workoutDocumentStorageChanges.writtenWorkoutDocumentJsons,
            workoutDocumentStorage.writeWorkoutDocumentJson,
            { discard: true },
          );

          yield* Effect.forEach(
            workoutDocumentStorageChanges.removedWorkoutIds,
            workoutDocumentStorage.removeWorkoutDocumentJson,
            { discard: true },
          );
        }),
    });
  },
);
