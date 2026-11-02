import type { Database } from "@ankaa/database/database";
import type * as Context from "effect/Context";

import { routine } from "@ankaa/database/schema/routine";
import { eq } from "drizzle-orm";
import * as Effect from "effect/Effect";

/**
 * Reads the Routine with `id` `FOR SHARE`, the one row that a write which
 * starts from a Routine or records against it locks without changing, so the
 * write waits for a deletion of the Routine that is committing, and then sees
 * it deleted, or gives null when the Routine doesn't exist:
 * https://github.com/manuelcattelan/ankaa/issues/133
 */
export const shareRoutine = Effect.fn("shareRoutine")(function* ({
  database,
  id,
}: {
  database: Context.Service.Shape<typeof Database>;
  id: string;
}) {
  const routines = yield* database
    .select({ deletedAt: routine.deletedAt, userId: routine.userId })
    .from(routine)
    .where(eq(routine.id, id))
    .for("share")
    .pipe(Effect.orDie);

  return routines[0] ?? null;
});
