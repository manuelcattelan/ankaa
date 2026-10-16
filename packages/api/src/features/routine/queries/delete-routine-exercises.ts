import type { DrizzleDatabase } from "@ankaa/database";

import * as RoutineDatabaseSchema from "@ankaa/database/schema/routine";
import { eq } from "drizzle-orm";

type DeleteRoutineExercisesOptions = {
  database: DrizzleDatabase;
  routineId: string;
};

export async function deleteRoutineExercises({
  database,
  routineId,
}: DeleteRoutineExercisesOptions) {
  await database
    .delete(RoutineDatabaseSchema.routineExercise)
    .where(eq(RoutineDatabaseSchema.routineExercise.routineId, routineId));
}
