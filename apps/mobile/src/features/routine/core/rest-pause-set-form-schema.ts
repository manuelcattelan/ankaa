import { MINIMUM_PAUSE_SECONDS } from "@ankaa/core/features/routine/constants/minimum-pause-seconds";
import { MINIMUM_SEGMENT_COUNT } from "@ankaa/core/features/routine/constants/minimum-segment-count";
import { pauseSecondsFilter } from "@ankaa/core/features/routine/filters/pause-seconds-filter";
import { segmentCountFilter } from "@ankaa/core/features/routine/filters/segment-count-filter";
import * as Schema from "effect/Schema";

import { createWholeNumberTextSchema } from "#/features/routine/core/create-whole-number-text-schema.ts";
import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";

export type RestPauseSetDraft = typeof restPauseSetFormSchema.Encoded;

export const restPauseSetFormSchema = Schema.TaggedStruct("RestPauseSet", {
  pauseSeconds: createWholeNumberTextSchema({
    filter: pauseSecondsFilter,
    message: ROUTINE_MESSAGES.wholeNumberBelowMinimumError(
      MINIMUM_PAUSE_SECONDS,
    ),
  }),
  segmentCount: createWholeNumberTextSchema({
    filter: segmentCountFilter,
    message: ROUTINE_MESSAGES.wholeNumberBelowMinimumError(
      MINIMUM_SEGMENT_COUNT,
    ),
  }),
});
