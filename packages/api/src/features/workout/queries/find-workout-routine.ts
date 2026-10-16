import type { DrizzleDatabase } from "@ankaa/database";

import { and, eq } from "@ankaa/database/operators";
import * as DatabaseSchema from "@ankaa/database/schema";

type FindWorkoutRoutineOptions = {
  database: DrizzleDatabase;
  routineId: string;
  userId: string;
};

export async function findWorkoutRoutine({
  database,
  routineId,
  userId,
}: FindWorkoutRoutineOptions) {
  const [workoutRoutine] = await database
    .select({ id: DatabaseSchema.routine.id })
    .from(DatabaseSchema.routine)
    .where(
      and(
        eq(DatabaseSchema.routine.id, routineId),
        eq(DatabaseSchema.routine.userId, userId),
      ),
    );

  return workoutRoutine;
}
