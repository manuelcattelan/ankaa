import type { RecordedSetDraft } from "#/features/workout/core/recorded-set-form-schema.ts";

import { createRecordedSetDraft } from "#/features/workout/core/create-recorded-set-draft.ts";

/**
 * Tells whether a Set's Draft holds the Segments that the server already
 * keeps for it, which for a new Set means one empty Segment, so it has
 * nothing to Save.
 */
export function isRecordedSetDraftSaved({
  draft,
  recordedSet,
}: {
  draft: RecordedSetDraft;
  recordedSet: null | {
    id: string;
    segments: readonly { amount: number; weight: null | number }[];
  };
}) {
  const savedSegments = createRecordedSetDraft(recordedSet).segments;

  return (
    draft.segments.length === savedSegments.length &&
    draft.segments.every(
      (segment, position) =>
        segment.amount === savedSegments[position]?.amount &&
        segment.weight === savedSegments[position].weight,
    )
  );
}
