import type { DrizzleDatabase } from "@ankaa/database";

import * as RoutineDatabaseSchema from "@ankaa/database/schema/routine";

import { insertRows } from "../../../shared/queries/insert-rows.ts";

type InsertRoutineExerciseSetsOptions = {
  database: DrizzleDatabase;
  routineExerciseSetRows: RoutineExerciseSetRow[];
};

type RoutineExerciseSetRow =
  typeof RoutineDatabaseSchema.routineExerciseSet.$inferInsert;

export async function insertRoutineExerciseSets({
  database,
  routineExerciseSetRows,
}: InsertRoutineExerciseSetsOptions) {
  await insertRows({
    database,
    rows: routineExerciseSetRows,
    table: RoutineDatabaseSchema.routineExerciseSet,
  });
}
