import * as Schema from "effect/Schema";

/**
 * The Wire error of a Set whose Segment count doesn't fit its matching
 * planned Set: exactly one Segment without an Intensity technique, and from
 * one up to the planned Segment count with one.
 */
export class SegmentCountInvalidError extends Schema.TaggedError<SegmentCountInvalidError>()(
  "SegmentCountInvalidError",
  {},
) {}
