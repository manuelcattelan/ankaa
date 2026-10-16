import type { DatabaseError } from "@ankaa/database/error";

import * as Match from "effect/Match";

import { protectedProcedure, router } from "../../trpc/procedures.ts";
import { run } from "../../trpc/run.ts";
import { listExercises } from "./interactors/list-exercises.ts";

function getExerciseErrorCode(error: DatabaseError) {
  return Match.valueTags(error, {
    DatabaseError: () => "INTERNAL_SERVER_ERROR" as const,
  });
}

export const exerciseRouter = router({
  list: protectedProcedure.query(({ ctx, signal }) =>
    run({
      context: ctx,
      effect: listExercises(),
      getErrorCode: getExerciseErrorCode,
      signal,
    }),
  ),
});
