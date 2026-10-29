import * as Schema from "effect/Schema";

/**
 * The Wire error of a Set with a weight in a Segment of a Workout exercise
 * whose Weight type is none.
 */
export class SegmentWeightNotAllowedError extends Schema.TaggedError<SegmentWeightNotAllowedError>()(
  "SegmentWeightNotAllowedError",
  {},
) {}
