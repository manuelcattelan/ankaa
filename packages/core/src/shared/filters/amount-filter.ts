import * as Schema from "effect/Schema";

import { MINIMUM_AMOUNT } from "#/shared/constants/amount.ts";

export const amountFilter = Schema.isGreaterThanOrEqualTo(MINIMUM_AMOUNT);
