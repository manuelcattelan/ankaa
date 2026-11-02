import * as Schema from "effect/Schema";

import { idSchema } from "#/shared/schemas/id-schema.ts";

/**
 * The Absence that `absence.remove` removes.
 */
export const absenceRemoveInputSchema = Schema.Struct({ id: idSchema });
