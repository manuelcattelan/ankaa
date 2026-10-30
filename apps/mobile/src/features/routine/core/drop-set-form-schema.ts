import {
  MAXIMUM_DROP_SET_WEIGHT_PERCENTAGE,
  MINIMUM_DROP_SET_WEIGHT_PERCENTAGE,
} from "@ankaa/core/features/routine/constants/drop-set";
import { dropSetWeightPercentageFilter } from "@ankaa/core/features/routine/filters/drop-set-weight-percentage-filter";
import * as Schema from "effect/Schema";

import { segmentCountFormSchema } from "#/features/routine/core/segment-count-form-schema.ts";
import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";
import { createNullableTextSchema } from "#/shared/core/create-nullable-text-schema.ts";
import { createWholeNumberTextSchema } from "#/shared/core/create-whole-number-text-schema.ts";

export type DropSetDraft = typeof dropSetFormSchema.Encoded;

export const dropSetFormSchema = Schema.TaggedStruct("DropSet", {
  segmentCount: segmentCountFormSchema,
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
