import * as Schema from "effect/Schema";

import { SEGMENT_COUNT_MINIMUM } from "../constants/segment.ts";

export const segmentCountFilter = Schema.isGreaterThanOrEqualTo(
  SEGMENT_COUNT_MINIMUM,
);
