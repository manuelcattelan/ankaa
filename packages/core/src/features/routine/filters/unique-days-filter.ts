import * as Schema from "effect/Schema";

/**
 * Checks that a Routine names each of its days of the week once.
 */
export const uniqueDaysFilter = Schema.isUnique();
