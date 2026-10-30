import * as Schema from "effect/Schema";

import { MINIMUM_PAUSE_SECONDS } from "#/features/routine/constants/minimum-pause-seconds.ts";

export const pauseSecondsFilter = Schema.isGreaterThanOrEqualTo(
  MINIMUM_PAUSE_SECONDS,
);
