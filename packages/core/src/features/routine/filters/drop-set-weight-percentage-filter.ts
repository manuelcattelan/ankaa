import * as Schema from "effect/Schema";

import {
  DROP_SET_WEIGHT_PERCENTAGE_MAXIMUM,
  DROP_SET_WEIGHT_PERCENTAGE_MINIMUM,
} from "../constants/drop-set.ts";

export const dropSetWeightPercentageFilter = Schema.isBetween({
  maximum: DROP_SET_WEIGHT_PERCENTAGE_MAXIMUM,
  minimum: DROP_SET_WEIGHT_PERCENTAGE_MINIMUM,
});
