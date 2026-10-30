import * as Effect from "effect/Effect";

import { ExerciseApplicationService } from "#/features/exercise/exercise-application-service.ts";
import { protectedProcedure, router } from "#/trpc/procedures.ts";
import { run } from "#/trpc/run.ts";

export const exerciseRouter = router({
  list: protectedProcedure.query(({ ctx, signal }) =>
    run({
      context: ctx,
      effect: Effect.gen(function* () {
        const exerciseApplicationService = yield* ExerciseApplicationService;

        return yield* exerciseApplicationService.list();
      }),
      errors: [],
      signal,
    }),
  ),
});
