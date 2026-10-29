import * as Schema from "effect/Schema";

import { WEIGHT_STEP } from "#/features/workout/constants/weight.ts";

export const weightStepFilter = Schema.isMultipleOf(WEIGHT_STEP);
