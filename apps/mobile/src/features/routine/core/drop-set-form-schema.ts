import {
  MAXIMUM_DROP_SET_WEIGHT_PERCENTAGE,
  MINIMUM_DROP_SET_WEIGHT_PERCENTAGE,
} from "@ankaa/core/features/routine/constants/drop-set";
import { MINIMUM_SEGMENT_COUNT } from "@ankaa/core/features/routine/constants/minimum-segment-count";
import { dropSetWeightPercentageFilter } from "@ankaa/core/features/routine/filters/drop-set-weight-percentage-filter";
import { segmentCountFilter } from "@ankaa/core/features/routine/filters/segment-count-filter";
import * as Schema from "effect/Schema";

import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";
import { createNullableTextSchema } from "#/shared/core/create-nullable-text-schema.ts";
import { createWholeNumberTextSchema } from "#/shared/core/create-whole-number-text-schema.ts";

export type DropSetDraft = typeof dropSetFormSchema.Encoded;

export const dropSetFormSchema = Schema.TaggedStruct("DropSet", {
  segmentCount: createWholeNumberTextSchema({
    filter: segmentCountFilter,
    message: ROUTINE_MESSAGES.wholeNumberBelowMinimumError(
      MINIMUM_SEGMENT_COUNT,
    ),
  }),
  weightPercentage: createNullableTextSchema(
    createWholeNumberTextSchema({
      filter: dropSetWeightPercentageFilter,
      message: ROUTINE_MESSAGES.wholeNumberOutOfRangeError({
        maximum: MAXIMUM_DROP_SET_WEIGHT_PERCENTAGE,
        minimum: MINIMUM_DROP_SET_WEIGHT_PERCENTAGE,
      }),
    }),
  ),
});
