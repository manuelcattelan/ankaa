import type { DrizzleDatabase } from "@ankaa/database";

import { eq } from "@ankaa/database/operators";
import * as DatabaseSchema from "@ankaa/database/schema";

type DeleteRoutineDaysOptions = {
  database: DrizzleDatabase;
  routineId: string;
};

export async function deleteRoutineDays({
  database,
  routineId,
}: DeleteRoutineDaysOptions) {
  await database
    .delete(DatabaseSchema.routineDay)
    .where(eq(DatabaseSchema.routineDay.routineId, routineId));
}
