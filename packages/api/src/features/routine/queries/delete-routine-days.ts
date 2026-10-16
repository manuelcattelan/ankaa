import type { DrizzleDatabase } from "@ankaa/database";

import * as RoutineDatabaseSchema from "@ankaa/database/schema/routine";
import { eq } from "drizzle-orm";

type DeleteRoutineDaysOptions = {
  database: DrizzleDatabase;
  routineId: string;
};

export async function deleteRoutineDays({
  database,
  routineId,
}: DeleteRoutineDaysOptions) {
  await database
    .delete(RoutineDatabaseSchema.routineDay)
    .where(eq(RoutineDatabaseSchema.routineDay.routineId, routineId));
}
