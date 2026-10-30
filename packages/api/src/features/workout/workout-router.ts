import { WORKOUT_REMOVE_SET_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-remove-set-wire-errors";
import { WORKOUT_SAVE_NOTE_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-save-note-wire-errors";
import { WORKOUT_SAVE_SET_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-save-set-wire-errors";
import { WORKOUT_SKIP_EXERCISE_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-skip-exercise-wire-errors";
import { WORKOUT_START_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-start-wire-errors";
import { WORKOUT_STOP_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-stop-wire-errors";
import { workoutRemoveSetInputSchema } from "@ankaa/core/features/workout/schemas/workout-remove-set-input-schema";
import { workoutSaveNoteInputSchema } from "@ankaa/core/features/workout/schemas/workout-save-note-input-schema";
import { workoutSaveSetInputSchema } from "@ankaa/core/features/workout/schemas/workout-save-set-input-schema";
import { workoutSkipExerciseInputSchema } from "@ankaa/core/features/workout/schemas/workout-skip-exercise-input-schema";
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
  removeSet: protectedProcedure
    .input(Schema.toStandardSchemaV1(workoutRemoveSetInputSchema))
    .mutation(({ ctx, input, signal }) =>
      run({
        context: ctx,
        effect: Effect.gen(function* () {
          const workoutApplicationService = yield* WorkoutApplicationService;

          yield* workoutApplicationService.removeSet({
            input,
            userId: ctx.session.user.id,
          });
        }),
        errors: WORKOUT_REMOVE_SET_WIRE_ERRORS,
        signal,
      }),
    ),
  saveNote: protectedProcedure
    .input(Schema.toStandardSchemaV1(workoutSaveNoteInputSchema))
    .mutation(({ ctx, input, signal }) =>
      run({
        context: ctx,
        effect: Effect.gen(function* () {
          const workoutApplicationService = yield* WorkoutApplicationService;

          yield* workoutApplicationService.saveNote({
            input,
            userId: ctx.session.user.id,
          });
        }),
        errors: WORKOUT_SAVE_NOTE_WIRE_ERRORS,
        signal,
      }),
    ),
  saveSet: protectedProcedure
    .input(Schema.toStandardSchemaV1(workoutSaveSetInputSchema))
    .mutation(({ ctx, input, signal }) =>
      run({
        context: ctx,
        effect: Effect.gen(function* () {
          const workoutApplicationService = yield* WorkoutApplicationService;

          yield* workoutApplicationService.saveSet({
            input,
            userId: ctx.session.user.id,
          });
        }),
        errors: WORKOUT_SAVE_SET_WIRE_ERRORS,
        signal,
      }),
    ),
  skipExercise: protectedProcedure
    .input(Schema.toStandardSchemaV1(workoutSkipExerciseInputSchema))
    .mutation(({ ctx, input, signal }) =>
      run({
        context: ctx,
        effect: Effect.gen(function* () {
          const workoutApplicationService = yield* WorkoutApplicationService;

          yield* workoutApplicationService.skipExercise({
            input,
            userId: ctx.session.user.id,
          });
        }),
        errors: WORKOUT_SKIP_EXERCISE_WIRE_ERRORS,
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
