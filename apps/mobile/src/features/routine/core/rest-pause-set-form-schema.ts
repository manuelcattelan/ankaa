import { MINIMUM_PAUSE_SECONDS } from "@ankaa/core/features/routine/constants/minimum-pause-seconds";
import { pauseSecondsFilter } from "@ankaa/core/features/routine/filters/pause-seconds-filter";
import * as Schema from "effect/Schema";

import { segmentCountFormSchema } from "#/features/routine/core/segment-count-form-schema.ts";
import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";
import { createWholeNumberTextSchema } from "#/shared/core/create-whole-number-text-schema.ts";

export type RestPauseSetDraft = typeof restPauseSetFormSchema.Encoded;

export const restPauseSetFormSchema = Schema.TaggedStruct("RestPauseSet", {
  pauseSeconds: createWholeNumberTextSchema({
    filter: pauseSecondsFilter,
    message: ROUTINE_MESSAGES.wholeNumberBelowMinimumError(
      MINIMUM_PAUSE_SECONDS,
    ),
  }),
  segmentCount: segmentCountFormSchema,
});
