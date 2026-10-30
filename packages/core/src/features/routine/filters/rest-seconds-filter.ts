import * as Schema from "effect/Schema";

import { MINIMUM_REST_SECONDS } from "#/features/routine/constants/minimum-rest-seconds.ts";

export const restSecondsFilter =
  Schema.isGreaterThanOrEqualTo(MINIMUM_REST_SECONDS);
