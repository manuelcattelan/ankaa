import type { DrizzleDatabase } from "@ankaa/database";

import * as RoutineDatabaseSchema from "@ankaa/database/schema/routine";
import { and, eq, isNull } from "drizzle-orm";

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
    .select({ id: RoutineDatabaseSchema.routine.id })
    .from(RoutineDatabaseSchema.routine)
    .where(
      and(
        eq(RoutineDatabaseSchema.routine.id, routineId),
        eq(RoutineDatabaseSchema.routine.userId, userId),
        isNull(RoutineDatabaseSchema.routine.deletedAt),
      ),
    )
    .for("update");

  return routine;
}
