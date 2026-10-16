import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import { workoutDocumentSchema } from "@/features/workout/core/workout-document-schema";

export function parseStoredWorkoutDocument(workoutDocumentJson: null | string) {
  if (!workoutDocumentJson) {
    return undefined;
  }

  return Option.getOrUndefined(
    Schema.decodeUnknownOption(workoutDocumentSchema)(
      JSON.parse(workoutDocumentJson),
    ),
  );
}
