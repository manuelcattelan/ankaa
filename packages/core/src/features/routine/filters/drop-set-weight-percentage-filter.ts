import * as Schema from "effect/Schema";

import {
  MAXIMUM_DROP_SET_WEIGHT_PERCENTAGE,
  MINIMUM_DROP_SET_WEIGHT_PERCENTAGE,
} from "#/features/routine/constants/drop-set.ts";

export const dropSetWeightPercentageFilter = Schema.isBetween({
  maximum: MAXIMUM_DROP_SET_WEIGHT_PERCENTAGE,
  minimum: MINIMUM_DROP_SET_WEIGHT_PERCENTAGE,
});
