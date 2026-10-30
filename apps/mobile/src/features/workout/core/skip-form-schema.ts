import { SKIP_REASONS } from "@ankaa/core/features/workout/constants/skip-reasons";
import { skipNoteFilter } from "@ankaa/core/features/workout/filters/skip-note-filter";
import * as Schema from "effect/Schema";

import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { createNullableTextSchema } from "#/shared/core/create-nullable-text-schema.ts";

export type SkipDraft = typeof skipFormSchema.Encoded;

export const skipFormSchema = Schema.Struct({
  note: createNullableTextSchema(Schema.String),
  reason: Schema.NullOr(Schema.Literals(SKIP_REASONS)),
}).check(
  skipNoteFilter.annotate({
    message: WORKOUT_MESSAGES.skipNoteWithoutReasonError,
  }),
);
