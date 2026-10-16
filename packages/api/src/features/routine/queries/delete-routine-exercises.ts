import type { DrizzleDatabase } from "@ankaa/database";

import { eq } from "@ankaa/database/operators";
import * as DatabaseSchema from "@ankaa/database/schema";

type DeleteRoutineExercisesOptions = {
  database: DrizzleDatabase;
  routineId: string;
};

export async function deleteRoutineExercises({
  database,
  routineId,
}: DeleteRoutineExercisesOptions) {
  await database
    .delete(DatabaseSchema.routineExercise)
    .where(eq(DatabaseSchema.routineExercise.routineId, routineId));
}
