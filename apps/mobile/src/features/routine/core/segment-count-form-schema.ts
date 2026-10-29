import { MINIMUM_SEGMENT_COUNT } from "@ankaa/core/features/routine/constants/minimum-segment-count";
import { segmentCountFilter } from "@ankaa/core/features/routine/filters/segment-count-filter";

import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";
import { createWholeNumberTextSchema } from "#/shared/core/create-whole-number-text-schema.ts";

/**
 * The Schema of the Segment count field of a Drop set or a Rest-pause set.
 */
export const segmentCountFormSchema = createWholeNumberTextSchema({
  filter: segmentCountFilter,
  message: ROUTINE_MESSAGES.wholeNumberBelowMinimumError(MINIMUM_SEGMENT_COUNT),
});
