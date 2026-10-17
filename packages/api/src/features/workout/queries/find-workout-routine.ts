import type { DrizzleDatabase } from "@ankaa/database";

import * as RoutineDatabaseSchema from "@ankaa/database/schema/routine";
import { and, eq } from "drizzle-orm";

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
    .select({ id: RoutineDatabaseSchema.routine.id })
    .from(RoutineDatabaseSchema.routine)
    .where(
      and(
        eq(RoutineDatabaseSchema.routine.id, routineId),
        eq(RoutineDatabaseSchema.routine.userId, userId),
      ),
    );

  return workoutRoutine;
}
