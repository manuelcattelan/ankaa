import type { DrizzleDatabase } from "@ankaa/database";

import * as DatabaseSchema from "@ankaa/database/schema";

type InsertRoutineExerciseSetsOptions = {
  database: DrizzleDatabase;
  routineExerciseSetRows: RoutineExerciseSetRow[];
};

type RoutineExerciseSetRow =
  typeof DatabaseSchema.routineExerciseSet.$inferInsert;

export async function insertRoutineExerciseSets({
  database,
  routineExerciseSetRows,
}: InsertRoutineExerciseSetsOptions) {
  if (routineExerciseSetRows.length === 0) {
    return;
  }

  await database
    .insert(DatabaseSchema.routineExerciseSet)
    .values(routineExerciseSetRows);
}
