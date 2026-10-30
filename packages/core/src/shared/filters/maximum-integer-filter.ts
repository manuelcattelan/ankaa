import * as Schema from "effect/Schema";

import { MAXIMUM_INTEGER } from "#/shared/constants/maximum-integer.ts";

export const maximumIntegerFilter = Schema.isLessThanOrEqualTo(MAXIMUM_INTEGER);
