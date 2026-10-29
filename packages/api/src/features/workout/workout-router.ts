import { WORKOUT_START_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-start-wire-errors";
import { WORKOUT_STOP_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-stop-wire-errors";
import { workoutStartInputSchema } from "@ankaa/core/features/workout/schemas/workout-start-input-schema";
import { workoutStopInputSchema } from "@ankaa/core/features/workout/schemas/workout-stop-input-schema";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";

import { WorkoutApplicationService } from "#/features/workout/workout-application-service.ts";
import { protectedProcedure, router } from "#/trpc/procedures.ts";
import { run } from "#/trpc/run.ts";

export const workoutRouter = router({
  findInProgress: protectedProcedure.query(({ ctx, signal }) =>
    run({
      context: ctx,
      effect: Effect.gen(function* () {
        const workoutApplicationService = yield* WorkoutApplicationService;

        return yield* workoutApplicationService.findInProgress({
          userId: ctx.session.user.id,
        });
      }),
      errors: [],
      signal,
    }),
  ),
  start: protectedProcedure
    .input(Schema.toStandardSchemaV1(workoutStartInputSchema))
    .mutation(({ ctx, input, signal }) =>
      run({
        context: ctx,
        effect: Effect.gen(function* () {
          const workoutApplicationService = yield* WorkoutApplicationService;

          yield* workoutApplicationService.start({
            input,
            userId: ctx.session.user.id,
          });
        }),
        errors: WORKOUT_START_WIRE_ERRORS,
        signal,
      }),
    ),
  stop: protectedProcedure
    .input(Schema.toStandardSchemaV1(workoutStopInputSchema))
    .mutation(({ ctx, input, signal }) =>
      run({
        context: ctx,
        effect: Effect.gen(function* () {
          const workoutApplicationService = yield* WorkoutApplicationService;

          yield* workoutApplicationService.stop({
            id: input.id,
            userId: ctx.session.user.id,
          });
        }),
        errors: WORKOUT_STOP_WIRE_ERRORS,
        signal,
      }),
    ),
});
