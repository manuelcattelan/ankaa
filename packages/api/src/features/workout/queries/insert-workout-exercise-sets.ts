import type { DrizzleDatabase } from "@ankaa/database";

import * as WorkoutDatabaseSchema from "@ankaa/database/schema/workout";

import { insertRows } from "../../../shared/queries/insert-rows.ts";

type InsertWorkoutExerciseSetsOptions = {
  database: DrizzleDatabase;
  workoutExerciseSetRows: WorkoutExerciseSetRow[];
};

type WorkoutExerciseSetRow =
  typeof WorkoutDatabaseSchema.workoutExerciseSet.$inferInsert;

export async function insertWorkoutExerciseSets({
  database,
  workoutExerciseSetRows,
}: InsertWorkoutExerciseSetsOptions) {
  await insertRows({
    database,
    rows: workoutExerciseSetRows,
    table: WorkoutDatabaseSchema.workoutExerciseSet,
  });
}
