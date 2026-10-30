import { maximumIntegerFilter } from "@ankaa/core/shared/filters/maximum-integer-filter";
import * as Schema from "effect/Schema";
import * as SchemaTransformation from "effect/SchemaTransformation";

const WHOLE_NUMBER_PATTERN = /^[0-9]+$/;

/**
 * Builds the Schema of a text field that holds a whole number, which decodes
 * to a number that passes `maximumIntegerFilter` and `filter`, and fails
 * every check with `message`.
 */
export function createWholeNumberTextSchema({
  filter,
  message,
}: {
  filter: Parameters<typeof Schema.Number.check>[0];
  message: string;
}) {
  return Schema.Trim.check(
    Schema.isPattern(WHOLE_NUMBER_PATTERN, { message }),
  ).pipe(
    Schema.decodeTo(
      Schema.Number.check(
        maximumIntegerFilter.annotate({ message }),
        filter.annotate({ message }),
      ),
      SchemaTransformation.numberFromString,
    ),
  );
}
