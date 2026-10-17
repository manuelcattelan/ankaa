import * as Effect from "effect/Effect";
import * as Match from "effect/Match";

import { parseStoredWorkoutDocument } from "@/features/workout/core/parse-stored-workout-document";
import { WorkoutDocumentStorage } from "@/features/workout/services/workout-document-storage";

export const readWorkoutDocuments = Effect.fn("readWorkoutDocuments")(
  function* () {
    const workoutDocumentStorage = yield* WorkoutDocumentStorage;

    const storedWorkoutDocumentJsons =
      yield* workoutDocumentStorage.readStoredWorkoutDocumentJsons();

    const workoutDocumentGroups = yield* Effect.forEach(
      storedWorkoutDocumentJsons,
      (storedWorkoutDocumentJson) =>
        Match.valueTags(
          parseStoredWorkoutDocument(
            storedWorkoutDocumentJson.workoutDocumentJson,
          ),
          {
            StoredWorkoutDocumentInvalid: () => Effect.succeed([]),
            StoredWorkoutDocumentJsonMalformed: (
              storedWorkoutDocumentJsonMalformed,
            ) => Effect.die(storedWorkoutDocumentJsonMalformed.cause),
            StoredWorkoutDocumentParsed: (storedWorkoutDocumentParsed) =>
              Effect.succeed([storedWorkoutDocumentParsed.workoutDocument]),
          },
        ),
    );

    return workoutDocumentGroups.flat();
  },
);
