import * as Schema from "effect/Schema";

/**
 * Checks that a skip with a note has a reason, because the note only tells
 * more about why the User skipped the Workout exercise.
 */
export const skipNoteFilter = Schema.makeFilter(
  (skip: { readonly note: null | string; readonly reason: null | string }) =>
    skip.reason !== null || skip.note === null,
  { expected: "a skip reason with a note" },
);
