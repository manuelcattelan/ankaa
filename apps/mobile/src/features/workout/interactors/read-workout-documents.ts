import * as Effect from "effect/Effect";

import { parseStoredWorkoutDocument } from "@/features/workout/core/parse-stored-workout-document";
import { WorkoutDocumentStorage } from "@/features/workout/services/workout-document-storage";

export const readWorkoutDocuments = Effect.fn("readWorkoutDocuments")(
  function* () {
    const workoutDocumentStorage = yield* WorkoutDocumentStorage;

    const storedWorkoutDocumentJsons =
      yield* workoutDocumentStorage.readStoredWorkoutDocumentJsons();

    return storedWorkoutDocumentJsons.flatMap((storedWorkoutDocumentJson) => {
      const workoutDocument = parseStoredWorkoutDocument(
        storedWorkoutDocumentJson.workoutDocumentJson,
      );

      return workoutDocument ? [workoutDocument] : [];
    });
  },
);
