import * as Schema from "effect/Schema";

import { identifierSchema } from "../../../shared/schemas/identifier-schema.ts";

export type RoutineDeleteInput = typeof routineDeleteInputSchema.Type;

export const routineDeleteInputSchema = Schema.Struct({
  id: identifierSchema,
});
