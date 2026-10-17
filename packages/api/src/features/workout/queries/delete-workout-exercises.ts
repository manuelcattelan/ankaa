import type { DrizzleDatabase } from "@ankaa/database";

import * as WorkoutDatabaseSchema from "@ankaa/database/schema/workout";
import { eq } from "drizzle-orm";

type DeleteWorkoutExercisesOptions = {
  database: DrizzleDatabase;
  workoutId: string;
};

export async function deleteWorkoutExercises({
  database,
  workoutId,
}: DeleteWorkoutExercisesOptions) {
  await database
    .delete(WorkoutDatabaseSchema.workoutExercise)
    .where(eq(WorkoutDatabaseSchema.workoutExercise.workoutId, workoutId));
}
