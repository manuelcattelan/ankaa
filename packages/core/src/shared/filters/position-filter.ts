import * as Schema from "effect/Schema";

import { POSITION_MINIMUM } from "../constants/position.ts";

export const positionFilter = Schema.isGreaterThanOrEqualTo(POSITION_MINIMUM);
