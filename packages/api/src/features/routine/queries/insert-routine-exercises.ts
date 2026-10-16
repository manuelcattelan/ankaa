import type { DrizzleDatabase } from "@ankaa/database";

import * as DatabaseSchema from "@ankaa/database/schema";

type InsertRoutineExercisesOptions = {
  database: DrizzleDatabase;
  routineExerciseRows: RoutineExerciseRow[];
};

type RoutineExerciseRow = typeof DatabaseSchema.routineExercise.$inferInsert;

export async function insertRoutineExercises({
  database,
  routineExerciseRows,
}: InsertRoutineExercisesOptions) {
  if (routineExerciseRows.length === 0) {
    return;
  }

  await database
    .insert(DatabaseSchema.routineExercise)
    .values(routineExerciseRows);
}
