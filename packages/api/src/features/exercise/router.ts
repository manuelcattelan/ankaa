import { absurd } from "effect/Function";

import { protectedProcedure, router } from "../../trpc/procedures.ts";
import { run } from "../../trpc/run.ts";
import { listExercises } from "./interactors/list-exercises.ts";

export const exerciseRouter = router({
  list: protectedProcedure.query(({ ctx, signal }) =>
    run({
      context: ctx,
      effect: listExercises(),
      getErrorCode: absurd,
      signal,
    }),
  ),
});
