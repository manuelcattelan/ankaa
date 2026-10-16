import type { DrizzleDatabase } from "@ankaa/database";

import * as RoutineDatabaseSchema from "@ankaa/database/schema/routine";
import { eq, sql } from "drizzle-orm";

type UpdateRoutineDeletedAtOptions = {
  database: DrizzleDatabase;
  routineId: string;
};

export async function updateRoutineDeletedAt({
  database,
  routineId,
}: UpdateRoutineDeletedAtOptions) {
  await database
    .update(RoutineDatabaseSchema.routine)
    .set({ deletedAt: sql`now()` })
    .where(eq(RoutineDatabaseSchema.routine.id, routineId));
}
