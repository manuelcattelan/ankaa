import * as Schema from "effect/Schema";

import {
  MAXIMUM_WEIGHT,
  MINIMUM_WEIGHT,
} from "#/features/workout/constants/weight.ts";

export const weightFilter = Schema.isBetween({
  maximum: MAXIMUM_WEIGHT,
  minimum: MINIMUM_WEIGHT,
});
