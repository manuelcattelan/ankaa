import * as Schema from "effect/Schema";

export type WireError = typeof wireErrorSchema.Type;

/**
 * The union of every Wire error, which the error formatter encodes with.
 */
export const wireErrorSchema = Schema.Union([]);
