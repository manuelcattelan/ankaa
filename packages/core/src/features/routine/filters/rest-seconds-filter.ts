import * as Schema from "effect/Schema";

import { REST_SECONDS_MINIMUM } from "../constants/rest.ts";

export const restSecondsFilter =
  Schema.isGreaterThanOrEqualTo(REST_SECONDS_MINIMUM);
