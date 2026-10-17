import type { DrizzleDatabase } from "@ankaa/database";

import * as RoutineDatabaseSchema from "@ankaa/database/schema/routine";
import { and, eq, isNull, ne } from "drizzle-orm";

type FindRoutineWithSameNameOptions = {
  database: DrizzleDatabase;
  routineId: string;
  routineName: string;
  userId: string;
};

export async function findRoutineWithSameName({
  database,
  routineId,
  routineName,
  userId,
}: FindRoutineWithSameNameOptions) {
  const [routineWithSameName] = await database
    .select({ id: RoutineDatabaseSchema.routine.id })
    .from(RoutineDatabaseSchema.routine)
    .where(
      and(
        eq(RoutineDatabaseSchema.routine.userId, userId),
        eq(RoutineDatabaseSchema.routine.name, routineName),
        isNull(RoutineDatabaseSchema.routine.deletedAt),
        ne(RoutineDatabaseSchema.routine.id, routineId),
      ),
    )
    .limit(1);

  return routineWithSameName;
}
