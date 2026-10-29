import * as Schema from "effect/Schema";

import { createNullableTextSchema } from "#/shared/core/create-nullable-text-schema.ts";

export type NoteDraft = typeof noteFormSchema.Encoded;

export const noteFormSchema = Schema.Struct({
  note: createNullableTextSchema(Schema.String),
});
