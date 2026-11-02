import * as Schema from "effect/Schema";

/**
 * The Wire error of a stop with no Skip reason while some Workout exercise of
 * its Workout has no Skip and fewer recorded Working sets than planned, which
 * the stop would Skip with that reason.
 */
export class SkipReasonMissingError extends Schema.TaggedError<SkipReasonMissingError>()(
  "SkipReasonMissingError",
  {},
) {}
