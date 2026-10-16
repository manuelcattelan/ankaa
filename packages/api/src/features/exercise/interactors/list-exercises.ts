import { Database } from "@ankaa/database";
import * as Effect from "effect/Effect";

import { findExercises } from "../queries/find-exercises.ts";

export const listExercises = Effect.fn("listExercises")(function* () {
  const database = yield* Database;

  return yield* database.query(findExercises);
});
