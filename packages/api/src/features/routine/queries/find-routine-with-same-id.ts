import type { DrizzleDatabase } from "@ankaa/database";

import * as RoutineDatabaseSchema from "@ankaa/database/schema/routine";
import { eq } from "drizzle-orm";

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
      deletedAt: RoutineDatabaseSchema.routine.deletedAt,
      userId: RoutineDatabaseSchema.routine.userId,
    })
    .from(RoutineDatabaseSchema.routine)
    .where(eq(RoutineDatabaseSchema.routine.id, routineId))
    .for("update");

  return routineWithSameId;
}
