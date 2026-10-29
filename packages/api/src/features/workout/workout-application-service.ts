import type { SegmentCountInvalidError } from "@ankaa/core/features/workout/errors/segment-count-invalid-error";
import type { SegmentWeightNotAllowedError } from "@ankaa/core/features/workout/errors/segment-weight-not-allowed-error";
import type { WorkoutInProgressConflictError } from "@ankaa/core/features/workout/errors/workout-in-progress-conflict-error";
import type { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";
import type { WorkoutRemoveSetInput } from "@ankaa/core/features/workout/schemas/workout-remove-set-input-schema";
import type { WorkoutSaveSetInput } from "@ankaa/core/features/workout/schemas/workout-save-set-input-schema";
import type { WorkoutStartInput } from "@ankaa/core/features/workout/schemas/workout-start-input-schema";
import type { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";

import { Database } from "@ankaa/database/database";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";

import { decideRecordedSetRemove } from "#/features/workout/core/decide-recorded-set-remove.ts";
import { decideRecordedSetSave } from "#/features/workout/core/decide-recorded-set-save.ts";
import { decideWorkoutStart } from "#/features/workout/core/decide-workout-start.ts";
import { decideWorkoutStop } from "#/features/workout/core/decide-workout-stop.ts";
import { WorkoutRepository } from "#/features/workout/workout-repository.ts";

export class WorkoutApplicationService extends Context.Service<
  WorkoutApplicationService,
  {
    readonly findInProgress: WorkoutRepository["Service"]["findInProgress"];
    readonly removeSet: (options: {
      input: WorkoutRemoveSetInput;
      userId: string;
    }) => Effect.Effect<void, WorkoutNotFoundError>;
    readonly saveSet: (options: {
      input: WorkoutSaveSetInput;
      userId: string;
    }) => Effect.Effect<
      void,
      | SegmentCountInvalidError
      | SegmentWeightNotAllowedError
      | WorkoutNotFoundError
    >;
    readonly start: (options: {
      input: WorkoutStartInput;
      userId: string;
    }) => Effect.Effect<
      void,
      RoutineNotFoundError | WorkoutInProgressConflictError
    >;
    readonly stop: (options: {
      id: string;
      userId: string;
    }) => Effect.Effect<void, WorkoutNotFoundError>;
  }
>()("@ankaa/api/features/workout/WorkoutApplicationService") {
  static readonly layerNoDeps = Layer.effect(
    WorkoutApplicationService,
    Effect.gen(function* () {
      const database = yield* Database;
      const workoutRepository = yield* WorkoutRepository;

      const findInProgress = Effect.fn(
        "WorkoutApplicationService.findInProgress",
      )(function* ({ userId }: { userId: string }) {
        return yield* workoutRepository.findInProgress({ userId });
      });

      const removeSet = Effect.fn("WorkoutApplicationService.removeSet")(
        function* ({
          input,
          userId,
        }: {
          input: WorkoutRemoveSetInput;
          userId: string;
        }) {
          yield* database
            .transaction(() =>
              Effect.gen(function* () {
                const workoutExercise =
                  yield* workoutRepository.findWorkoutExerciseForUpdate({
                    id: input.workoutExerciseId,
                  });

                yield* Match.valueTags(
                  decideRecordedSetRemove({ userId, workoutExercise }),
                  {
                    NoRecordedSetToRemove: () => Effect.void,
                    RecordedSetRemoveAllowed: (outcome) =>
                      workoutRepository.removeSet({ id: outcome.id }),
                    WorkoutNotFoundError: (error) => Effect.fail(error),
                  },
                );
              }),
            )
            .pipe(Effect.catchTag("SqlError", (error) => Effect.die(error)));
        },
      );

      const saveSet = Effect.fn("WorkoutApplicationService.saveSet")(
        function* ({
          input,
          userId,
        }: {
          input: WorkoutSaveSetInput;
          userId: string;
        }) {
          yield* database
            .transaction(() =>
              Effect.gen(function* () {
                const workoutExercise =
                  yield* workoutRepository.findWorkoutExerciseForUpdate({
                    id: input.workoutExerciseId,
                  });

                yield* Match.valueTags(
                  decideRecordedSetSave({ input, userId, workoutExercise }),
                  {
                    RecordedSetSaveAllowed: (outcome) =>
                      workoutRepository.saveSet({
                        input,
                        position: outcome.position,
                      }),
                    SegmentCountInvalidError: (error) => Effect.fail(error),
                    SegmentWeightNotAllowedError: (error) => Effect.fail(error),
                    WorkoutNotFoundError: (error) => Effect.fail(error),
                  },
                );
              }),
            )
            .pipe(Effect.catchTag("SqlError", (error) => Effect.die(error)));
        },
      );

      const start = Effect.fn("WorkoutApplicationService.start")(function* ({
        input,
        userId,
      }: {
        input: WorkoutStartInput;
        userId: string;
      }) {
        yield* database
          .transaction(() =>
            Effect.gen(function* () {
              const routine = yield* workoutRepository.findRoutine({
                id: input.routineId,
              });
              const workout = yield* workoutRepository.find({
                id: input.id,
                userId,
              });

              yield* Match.valueTags(
                decideWorkoutStart({ routine, userId, workout }),
                {
                  RoutineNotFoundError: (error) => Effect.fail(error),
                  WorkoutAlreadyStarted: () => Effect.void,
                  WorkoutStartAllowed: (outcome) =>
                    workoutRepository.start({
                      id: input.id,
                      routine: outcome.routine,
                      userId,
                    }),
                },
              );
            }),
          )
          .pipe(Effect.catchTag("SqlError", (error) => Effect.die(error)));
      });

      const stop = Effect.fn("WorkoutApplicationService.stop")(function* ({
        id,
        userId,
      }: {
        id: string;
        userId: string;
      }) {
        yield* database
          .transaction(() =>
            Effect.gen(function* () {
              const workout = yield* workoutRepository.findForUpdate({ id });

              yield* Match.valueTags(decideWorkoutStop({ userId, workout }), {
                WorkoutAlreadyStopped: () => Effect.void,
                WorkoutNotFoundError: (error) => Effect.fail(error),
                WorkoutStopAllowed: () => workoutRepository.stop({ id }),
              });
            }),
          )
          .pipe(Effect.catchTag("SqlError", (error) => Effect.die(error)));
      });

      return WorkoutApplicationService.of({
        findInProgress,
        removeSet,
        saveSet,
        start,
        stop,
      });
    }),
  );

  static readonly layer = WorkoutApplicationService.layerNoDeps.pipe(
    Layer.provide([Database.layer, WorkoutRepository.layer]),
  );
}
