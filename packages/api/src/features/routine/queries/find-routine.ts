import type { DrizzleDatabase } from "@ankaa/database";

import { and, eq, isNull } from "@ankaa/database/operators";
import * as DatabaseSchema from "@ankaa/database/schema";

type FindRoutineOptions = {
  database: DrizzleDatabase;
  routineId: string;
  userId: string;
};

export async function findRoutine({
  database,
  routineId,
  userId,
}: FindRoutineOptions) {
  const [routine] = await database
    .select({ id: DatabaseSchema.routine.id })
    .from(DatabaseSchema.routine)
    .where(
      and(
        eq(DatabaseSchema.routine.id, routineId),
        eq(DatabaseSchema.routine.userId, userId),
        isNull(DatabaseSchema.routine.deletedAt),
      ),
    )
    .for("update");

  return routine;
}
