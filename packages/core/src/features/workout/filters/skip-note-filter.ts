import * as Schema from "effect/Schema";

/**
 * Checks that a Skip with a note has a reason, because the note only adds to
 * the reason.
 */
export const skipNoteFilter = Schema.makeFilter(
  (skip: { readonly note: null | string; readonly reason: null | string }) =>
    skip.reason !== null || skip.note === null,
  { expected: "a Skip reason with a note" },
);
