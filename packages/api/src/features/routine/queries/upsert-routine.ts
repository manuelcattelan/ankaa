import type { DrizzleDatabase } from "@ankaa/database";

import * as RoutineDatabaseSchema from "@ankaa/database/schema/routine";
import { sql } from "drizzle-orm";

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
    .insert(RoutineDatabaseSchema.routine)
    .values({ id: routineId, name: routineName, userId })
    .onConflictDoUpdate({
      set: { name: routineName, updatedAt: sql`now()` },
      target: RoutineDatabaseSchema.routine.id,
    });
}
