import * as Schema from "effect/Schema";

import { MINIMUM_SEGMENT_COUNT } from "#/features/routine/constants/minimum-segment-count.ts";

export const segmentCountFilter = Schema.isGreaterThanOrEqualTo(
  MINIMUM_SEGMENT_COUNT,
);
