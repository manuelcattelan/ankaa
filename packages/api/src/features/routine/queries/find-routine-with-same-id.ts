import type { DrizzleDatabase } from "@ankaa/database";

import { eq } from "@ankaa/database/operators";
import * as DatabaseSchema from "@ankaa/database/schema";

type FindRoutineWithSameIdOptions = {
  database: DrizzleDatabase;
  routineId: string;
};

export async function findRoutineWithSameId({
  database,
  routineId,
}: FindRoutineWithSameIdOptions) {
  const [routineWithSameId] = await database
    .select({
      deletedAt: DatabaseSchema.routine.deletedAt,
      userId: DatabaseSchema.routine.userId,
    })
    .from(DatabaseSchema.routine)
    .where(eq(DatabaseSchema.routine.id, routineId))
    .for("update");

  return routineWithSameId;
}
