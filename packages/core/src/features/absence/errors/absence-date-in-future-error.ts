import * as Schema from "effect/Schema";

/**
 * The Wire error of an Absence whose date is still in the future in the time
 * zone the device sent.
 */
export class AbsenceDateInFutureError extends Schema.TaggedError<AbsenceDateInFutureError>()(
  "AbsenceDateInFutureError",
  {},
) {}
