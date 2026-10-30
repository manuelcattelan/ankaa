import * as Schema from "effect/Schema";

import { maximumIntegerFilter } from "#/shared/filters/maximum-integer-filter.ts";

/**
 * A whole number that fits the PostgreSQL `integer` columns that store it.
 */
export const integerSchema = Schema.Int.check(maximumIntegerFilter);
