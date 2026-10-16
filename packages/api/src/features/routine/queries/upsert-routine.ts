import type { DrizzleDatabase } from "@ankaa/database";

import { and, eq, isNull, sql } from "@ankaa/database/operators";
import * as DatabaseSchema from "@ankaa/database/schema";

type UpsertRoutineOptions = {
  database: DrizzleDatabase;
  routineId: string;
  routineName: string;
  userId: string;
};

export async function upsertRoutine({
  database,
  routineId,
  routineName,
  userId,
}: UpsertRoutineOptions) {
  await database
    .insert(DatabaseSchema.routine)
    .values({ id: routineId, name: routineName, userId })
    .onConflictDoUpdate({
      set: { name: routineName, updatedAt: sql`now()` },
      setWhere: and(
        eq(DatabaseSchema.routine.userId, userId),
        isNull(DatabaseSchema.routine.deletedAt),
      ),
      target: DatabaseSchema.routine.id,
    });
}
