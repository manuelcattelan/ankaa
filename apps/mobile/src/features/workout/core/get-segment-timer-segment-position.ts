import type { SegmentDraft } from "#/features/workout/core/segment-form-schema.ts";

/**
 * Gives the position of the Segment of a Set's Draft that a Segment timer
 * fills in: the first of `segments` with no Amount, or the position of a new
 * Segment when every one has an Amount and `maximumSegmentCount` allows
 * another, or `null` when neither applies, so a full Set is never
 * overwritten.
 */
export function getSegmentTimerSegmentPosition({
  maximumSegmentCount,
  segments,
}: {
  maximumSegmentCount: number;
  segments: readonly SegmentDraft[];
}) {
  const position = segments.findIndex((segment) => segment.amount === "");

  if (segments[position] !== undefined) {
    return position;
  }

  return segments.length < maximumSegmentCount ? segments.length : null;
}
