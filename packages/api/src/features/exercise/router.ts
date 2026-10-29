import * as Effect from "effect/Effect";
import { absurd } from "effect/Function";

import { protectedProcedure, router } from "../../trpc/procedures.ts";
import { run } from "../../trpc/run.ts";
import { ExerciseApplicationService } from "./exercise-application-service.ts";

export const exerciseRouter = router({
  list: protectedProcedure.query(({ ctx, signal }) =>
    run({
      context: ctx,
      effect: Effect.gen(function* () {
        const exerciseApplicationService = yield* ExerciseApplicationService;

        return yield* exerciseApplicationService.list();
      }),
      getErrorCode: absurd,
      signal,
    }),
  ),
});
