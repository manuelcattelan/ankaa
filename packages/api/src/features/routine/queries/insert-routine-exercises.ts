import type { DrizzleDatabase } from "@ankaa/database";

import * as RoutineDatabaseSchema from "@ankaa/database/schema/routine";

import { insertRows } from "../../../shared/queries/insert-rows.ts";

type InsertRoutineExercisesOptions = {
  database: DrizzleDatabase;
  routineExerciseRows: RoutineExerciseRow[];
};

type RoutineExerciseRow =
  typeof RoutineDatabaseSchema.routineExercise.$inferInsert;

export async function insertRoutineExercises({
  database,
  routineExerciseRows,
}: InsertRoutineExercisesOptions) {
  await insertRows({
    database,
    rows: routineExerciseRows,
    table: RoutineDatabaseSchema.routineExercise,
  });
}
