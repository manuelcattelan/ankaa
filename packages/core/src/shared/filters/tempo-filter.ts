import * as Schema from "effect/Schema";

import { TEMPO_PATTERN } from "#/shared/constants/tempo-pattern.ts";

export const tempoFilter = Schema.isPattern(TEMPO_PATTERN);
