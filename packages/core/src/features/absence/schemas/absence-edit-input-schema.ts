import * as Schema from "effect/Schema";

import { absenceRecordInputSchema } from "#/features/absence/schemas/absence-record-input-schema.ts";
import { idSchema } from "#/shared/schemas/id-schema.ts";

export type AbsenceEditInput = typeof absenceEditInputSchema.Type;

/**
 * The Absence with `id` that `absence.edit` changes, with every field that
 * `absence.record` takes, under the same checks.
 */
export const absenceEditInputSchema = Schema.Struct({
  ...absenceRecordInputSchema.fields,
  id: idSchema,
});
