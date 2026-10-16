import type { DrizzleDatabase } from "@ankaa/database";

import { and, eq, isNull, sql } from "@ankaa/database/operators";
import * as DatabaseSchema from "@ankaa/database/schema";

type UpdateRoutineDeletedAtOptions = {
  database: DrizzleDatabase;
  routineId: string;
  userId: string;
};

export async function updateRoutineDeletedAt({
  database,
  routineId,
  userId,
}: UpdateRoutineDeletedAtOptions) {
  await database
    .update(DatabaseSchema.routine)
    .set({ deletedAt: sql`now()` })
    .where(
      and(
        eq(DatabaseSchema.routine.id, routineId),
        eq(DatabaseSchema.routine.userId, userId),
        isNull(DatabaseSchema.routine.deletedAt),
      ),
    );
}
