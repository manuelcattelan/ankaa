import * as Schema from "effect/Schema";

import { idSchema } from "#/shared/schemas/id-schema.ts";

export type RoutineDeleteInput = typeof routineDeleteInputSchema.Type;

export const routineDeleteInputSchema = Schema.Struct({ id: idSchema });
