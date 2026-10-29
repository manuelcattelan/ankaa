import { ROUTINE_DELETE_WIRE_ERRORS } from "@ankaa/core/features/routine/errors/routine-delete-wire-errors";
import { routineDeleteInputSchema } from "@ankaa/core/features/routine/schemas/routine-delete-input-schema";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";

import { RoutineApplicationService } from "#/features/routine/routine-application-service.ts";
import { protectedProcedure, router } from "#/trpc/procedures.ts";
import { run } from "#/trpc/run.ts";

export const routineRouter = router({
  delete: protectedProcedure
    .input(Schema.toStandardSchemaV1(routineDeleteInputSchema))
    .mutation(({ ctx, input, signal }) =>
      run({
        context: ctx,
        effect: Effect.gen(function* () {
          const routineApplicationService = yield* RoutineApplicationService;

          yield* routineApplicationService.delete({
            id: input.id,
            userId: ctx.session.user.id,
          });
        }),
        errors: ROUTINE_DELETE_WIRE_ERRORS,
        signal,
      }),
    ),
  list: protectedProcedure.query(({ ctx, signal }) =>
    run({
      context: ctx,
      effect: Effect.gen(function* () {
        const routineApplicationService = yield* RoutineApplicationService;

        return yield* routineApplicationService.list({
          userId: ctx.session.user.id,
        });
      }),
      errors: [],
      signal,
    }),
  ),
});
