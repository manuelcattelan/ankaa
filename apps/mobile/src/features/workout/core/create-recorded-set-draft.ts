/**
 * Creates the Draft of a Set from the recorded Set it edits, or of a new Set,
 * whose id is created only when it's first Saved, when `recordedSet` is
 * `null`.
 */
export function createRecordedSetDraft(
  recordedSet: null | {
    id: string;
    segments: readonly { amount: number; weight: null | number }[];
  },
) {
  if (recordedSet === null) {
    return { id: "", segments: [{ amount: "", weight: "" }] };
  }

  return {
    id: recordedSet.id,
    segments: recordedSet.segments.map((segment) => ({
      amount: String(segment.amount),
      weight: segment.weight === null ? "" : String(segment.weight),
    })),
  };
}
