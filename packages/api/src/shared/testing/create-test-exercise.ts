import { Database } from "@ankaa/database";
import { exercise } from "@ankaa/database/schema/exercise";
import * as Effect from "effect/Effect";

type ExerciseRow = typeof exercise.$inferInsert;

type TestExerciseOptions = Partial<ExerciseRow> &
  Pick<ExerciseRow, "id" | "name">;

export const createTestExercise = Effect.fn("createTestExercise")(function* (
  testExerciseOptions: TestExerciseOptions,
) {
  const database = yield* Database;

  yield* database.query((drizzleDatabase) =>
    drizzleDatabase.insert(exercise).values({
      amountUnit: "repetition",
      weightType: "total",
      ...testExerciseOptions,
    }),
  );
});
