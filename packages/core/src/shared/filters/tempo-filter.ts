import * as Schema from "effect/Schema";

import { TEMPO_PATTERN } from "../constants/tempo.ts";

export const tempoFilter = Schema.isPattern(TEMPO_PATTERN);
