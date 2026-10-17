import type { DrizzleDatabase } from "@ankaa/database";

import * as WorkoutDatabaseSchema from "@ankaa/database/schema/workout";

import { insertRows } from "../../../shared/queries/insert-rows.ts";

type InsertWorkoutExercisesOptions = {
  database: DrizzleDatabase;
  workoutExerciseRows: WorkoutExerciseRow[];
};

type WorkoutExerciseRow =
  typeof WorkoutDatabaseSchema.workoutExercise.$inferInsert;

export async function insertWorkoutExercises({
  database,
  workoutExerciseRows,
}: InsertWorkoutExercisesOptions) {
  await insertRows({
    database,
    rows: workoutExerciseRows,
    table: WorkoutDatabaseSchema.workoutExercise,
  });
}
