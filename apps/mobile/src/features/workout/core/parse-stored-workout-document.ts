import * as Data from "effect/Data";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import type { WorkoutDocument } from "@/features/workout/core/workout-document-schema";

import { workoutDocumentSchema } from "@/features/workout/core/workout-document-schema";

export type StoredWorkoutDocumentParseOutcome = Data.TaggedEnum<{
  StoredWorkoutDocumentInvalid: object;
  StoredWorkoutDocumentJsonMalformed: { readonly cause: unknown };
  StoredWorkoutDocumentParsed: { readonly workoutDocument: WorkoutDocument };
}>;

const StoredWorkoutDocumentParseOutcome =
  Data.taggedEnum<StoredWorkoutDocumentParseOutcome>();

export function parseStoredWorkoutDocument(workoutDocumentJson: null | string) {
  if (!workoutDocumentJson) {
    return StoredWorkoutDocumentParseOutcome.StoredWorkoutDocumentInvalid();
  }

  try {
    return Option.match(
      Schema.decodeUnknownOption(workoutDocumentSchema)(
        JSON.parse(workoutDocumentJson),
      ),
      {
        onNone: () =>
          StoredWorkoutDocumentParseOutcome.StoredWorkoutDocumentInvalid(),
        onSome: (workoutDocument) =>
          StoredWorkoutDocumentParseOutcome.StoredWorkoutDocumentParsed({
            workoutDocument,
          }),
      },
    );
  } catch (error) {
    return StoredWorkoutDocumentParseOutcome.StoredWorkoutDocumentJsonMalformed(
      { cause: error },
    );
  }
}
