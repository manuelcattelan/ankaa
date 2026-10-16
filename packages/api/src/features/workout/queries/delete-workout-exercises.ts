import type { DrizzleDatabase } from "@ankaa/database";

import { eq } from "@ankaa/database/operators";
import * as DatabaseSchema from "@ankaa/database/schema";

type DeleteWorkoutExercisesOptions = {
  database: DrizzleDatabase;
  workoutId: string;
};

export async function deleteWorkoutExercises({
  database,
  workoutId,
}: DeleteWorkoutExercisesOptions) {
  await database
    .delete(DatabaseSchema.workoutExercise)
    .where(eq(DatabaseSchema.workoutExercise.workoutId, workoutId));
}
