import { Database } from "@ankaa/database";
import { exercise } from "@ankaa/database/schema/exercise";
import * as Effect from "effect/Effect";

type CreateTestExerciseOptions = Partial<ExerciseRow> &
  Pick<ExerciseRow, "id" | "name">;

type ExerciseRow = typeof exercise.$inferInsert;

export const createTestExercise = Effect.fn("createTestExercise")(function* (
  createTestExerciseOptions: CreateTestExerciseOptions,
) {
  const database = yield* Database;

  yield* database.query((drizzleDatabase) =>
    drizzleDatabase.insert(exercise).values({
      amountUnit: "repetition",
      weightType: "total",
      ...createTestExerciseOptions,
    }),
  );
});
