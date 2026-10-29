import * as Schema from "effect/Schema";

import type { RecordedSet } from "#/shared/workout.ts";

import { recordedSetFormSchema } from "#/features/workout/core/recorded-set-form-schema.ts";

const encodeRecordedSet = Schema.encodeSync(recordedSetFormSchema);

/**
 * Creates the Draft of a Set from the recorded Set it edits, or of a new Set,
 * whose id is created only when it's first Saved, when `recordedSet` is
 * `null`.
 */
export function createRecordedSetDraft(recordedSet: null | RecordedSet) {
  if (recordedSet === null) {
    return { id: "", segments: [{ amount: "", weight: "" }] };
  }

  return encodeRecordedSet(recordedSet);
}
