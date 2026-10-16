import * as Schema from "effect/Schema";

import {
  WEIGHT_VALUE_MAXIMUM,
  WEIGHT_VALUE_MINIMUM,
  WEIGHT_VALUE_STEP,
} from "../constants/weight.ts";

const WEIGHT_VALUE_STEP_TOLERANCE_EPSILON_COUNT = 4;
const WEIGHT_VALUE_STEP_TOLERANCE_SCALE_MINIMUM = 1;

const weightValueStepFilter = Schema.makeFilter(
  (weightValue: number) => {
    const weightValueStepRatio = weightValue / WEIGHT_VALUE_STEP;
    const weightValueStepTolerance =
      WEIGHT_VALUE_STEP_TOLERANCE_EPSILON_COUNT *
      Number.EPSILON *
      Math.max(
        Math.abs(weightValueStepRatio),
        WEIGHT_VALUE_STEP_TOLERANCE_SCALE_MINIMUM,
      );

    return (
      Math.abs(weightValueStepRatio - Math.round(weightValueStepRatio)) <
      weightValueStepTolerance
    );
  },
  { expected: `a value that is a multiple of ${WEIGHT_VALUE_STEP}` },
);

export const weightValueFilter = Schema.makeFilterGroup([
  Schema.isBetween({
    maximum: WEIGHT_VALUE_MAXIMUM,
    minimum: WEIGHT_VALUE_MINIMUM,
  }),
  weightValueStepFilter,
]);
