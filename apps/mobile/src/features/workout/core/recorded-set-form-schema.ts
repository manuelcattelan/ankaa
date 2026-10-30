import { idSchema } from "@ankaa/core/shared/schemas/id-schema";
import * as Schema from "effect/Schema";

import { segmentFormSchema } from "#/features/workout/core/segment-form-schema.ts";

export type RecordedSetDraft = typeof recordedSetFormSchema.Encoded;

export const recordedSetFormSchema = Schema.Struct({
  id: idSchema,
  segments: Schema.Array(segmentFormSchema),
});
