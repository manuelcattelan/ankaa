import * as Schema from "effect/Schema";

import { AMOUNT_MINIMUM } from "../constants/amount.ts";

export const amountFilter = Schema.isGreaterThanOrEqualTo(AMOUNT_MINIMUM);
