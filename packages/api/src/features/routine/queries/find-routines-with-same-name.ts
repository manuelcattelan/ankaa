import type { DrizzleDatabase } from "@ankaa/database";

import { and, eq, isNull, ne } from "@ankaa/database/operators";
import * as DatabaseSchema from "@ankaa/database/schema";

type FindRoutinesWithSameNameOptions = {
  database: DrizzleDatabase;
  routineId: string;
  routineName: string;
  userId: string;
};

export async function findRoutinesWithSameName({
  database,
  routineId,
  routineName,
  userId,
}: FindRoutinesWithSameNameOptions) {
  return database
    .select({ id: DatabaseSchema.routine.id })
    .from(DatabaseSchema.routine)
    .where(
      and(
        eq(DatabaseSchema.routine.userId, userId),
        eq(DatabaseSchema.routine.name, routineName),
        isNull(DatabaseSchema.routine.deletedAt),
        ne(DatabaseSchema.routine.id, routineId),
      ),
    );
}
