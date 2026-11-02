import { SKIP_REASONS } from "@ankaa/core/shared/constants/skip-reasons";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";

import { ABSENCE_MESSAGES } from "#/features/absence/messages/absence-messages.ts";
import { createNullableTextSchema } from "#/shared/core/create-nullable-text-schema.ts";

/**
 * Builds the Schema of the form that records an Absence, whose date mustn't
 * be after `today`, the calendar date on the device in its own time zone.
 * The reason starts empty, because an Absence has no default reason, and
 * decodes only once the User picks one.
 */
export function createAbsenceFormSchema({ today }: { today: string }) {
  return Schema.Struct({
    date: Schema.String.check(
      Schema.makeFilter(
        // Calendar dates in ISO 8601's `YYYY-MM-DD` order as strings do:
        // https://en.wikipedia.org/wiki/ISO_8601#General_principles
        (date: string) => date <= today,
        { message: ABSENCE_MESSAGES.dateInFutureError },
      ),
    ),
    note: createNullableTextSchema(Schema.String),
    reason: Schema.NullOr(Schema.Literals(SKIP_REASONS)).pipe(
      Schema.refine(Predicate.isNotNull, {
        message: ABSENCE_MESSAGES.reasonMissingError,
      }),
    ),
  });
}
