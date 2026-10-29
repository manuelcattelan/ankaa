import type { SegmentCountInvalidError } from "@ankaa/core/features/workout/errors/segment-count-invalid-error";
import type { SegmentWeightNotAllowedError } from "@ankaa/core/features/workout/errors/segment-weight-not-allowed-error";
import type { WorkoutInProgressConflictError } from "@ankaa/core/features/workout/errors/workout-in-progress-conflict-error";
import type { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";
import type { WorkoutRemoveSetInput } from "@ankaa/core/features/workout/schemas/workout-remove-set-input-schema";
import type { WorkoutSaveNoteInput } from "@ankaa/core/features/workout/schemas/workout-save-note-input-schema";
import type { WorkoutSaveSetInput } from "@ankaa/core/features/workout/schemas/workout-save-set-input-schema";
import type { WorkoutSkipExerciseInput } from "@ankaa/core/features/workout/schemas/workout-skip-exercise-input-schema";
import type { WorkoutStartInput } from "@ankaa/core/features/workout/schemas/workout-start-input-schema";
import type { WorkoutStopInput } from "@ankaa/core/features/workout/schemas/workout-stop-input-schema";
import type { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";

import { WORKOUT_REMOVE_SET_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-remove-set-wire-errors";
import { WORKOUT_SAVE_NOTE_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-save-note-wire-errors";
import { WORKOUT_SAVE_SET_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-save-set-wire-errors";
import { WORKOUT_SKIP_EXERCISE_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-skip-exercise-wire-errors";
import { WORKOUT_START_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-start-wire-errors";
import { WORKOUT_STOP_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-stop-wire-errors";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { constUndefined } from "effect/Function";
import * as Layer from "effect/Layer";

import type { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";
import type { ScheduledNotification } from "#/shared/services/notifications.ts";
import type { Workout } from "#/shared/workout.ts";

import { Notifications } from "#/shared/services/notifications.ts";
import { TrpcClient } from "#/shared/services/trpc-client.ts";

export class WorkoutApplicationService extends Context.Service<
  WorkoutApplicationService,
  {
    readonly cancelCountdownNotification: () => Effect.Effect<void>;
    readonly findInProgress: () => Effect.Effect<
      null | Workout,
      TrpcClientError
    >;
    readonly removeSet: (
      input: WorkoutRemoveSetInput,
    ) => Effect.Effect<void, TrpcClientError | WorkoutNotFoundError>;
    readonly saveNote: (
      input: WorkoutSaveNoteInput,
    ) => Effect.Effect<void, TrpcClientError | WorkoutNotFoundError>;
    readonly saveSet: (
      input: WorkoutSaveSetInput,
    ) => Effect.Effect<
      void,
      | SegmentCountInvalidError
      | SegmentWeightNotAllowedError
      | TrpcClientError
      | WorkoutNotFoundError
    >;
    readonly scheduleCountdownNotification: (
      notification: ScheduledNotification,
    ) => Effect.Effect<void>;
    readonly skipExercise: (
      input: WorkoutSkipExerciseInput,
    ) => Effect.Effect<void, TrpcClientError | WorkoutNotFoundError>;
    readonly start: (
      input: WorkoutStartInput,
    ) => Effect.Effect<
      void,
      | RoutineNotFoundError
      | TrpcClientError
      | WorkoutInProgressConflictError
      | WorkoutNotFoundError
    >;
    readonly stop: (
      input: WorkoutStopInput,
    ) => Effect.Effect<void, TrpcClientError | WorkoutNotFoundError>;
  }
>()("@ankaa/mobile/features/workout/WorkoutApplicationService") {
  static readonly layerNoDeps = Layer.effect(
    WorkoutApplicationService,
    Effect.gen(function* () {
      const notifications = yield* Notifications;
      const trpcClient = yield* TrpcClient;

      const cancelCountdownNotification = Effect.fn(
        "WorkoutApplicationService.cancelCountdownNotification",
      )(function* () {
        yield* notifications.cancelAllScheduled();
      });

      const findInProgress = Effect.fn(
        "WorkoutApplicationService.findInProgress",
      )(function* () {
        return yield* trpcClient.request({
          call: ({ signal, trpc }) =>
            trpc.workout.findInProgress.query(constUndefined(), { signal }),
          errors: [],
        });
      });

      const removeSet = Effect.fn("WorkoutApplicationService.removeSet")(
        function* (input: WorkoutRemoveSetInput) {
          yield* trpcClient.request({
            call: ({ signal, trpc }) =>
              trpc.workout.removeSet.mutate(input, { signal }),
            errors: WORKOUT_REMOVE_SET_WIRE_ERRORS,
          });
        },
      );

      const saveNote = Effect.fn("WorkoutApplicationService.saveNote")(
        function* (input: WorkoutSaveNoteInput) {
          yield* trpcClient.request({
            call: ({ signal, trpc }) =>
              trpc.workout.saveNote.mutate(input, { signal }),
            errors: WORKOUT_SAVE_NOTE_WIRE_ERRORS,
          });
        },
      );

      const saveSet = Effect.fn("WorkoutApplicationService.saveSet")(function* (
        input: WorkoutSaveSetInput,
      ) {
        yield* trpcClient.request({
          call: ({ signal, trpc }) =>
            trpc.workout.saveSet.mutate(input, { signal }),
          errors: WORKOUT_SAVE_SET_WIRE_ERRORS,
        });
      });

      const skipExercise = Effect.fn("WorkoutApplicationService.skipExercise")(
        function* (input: WorkoutSkipExerciseInput) {
          yield* trpcClient.request({
            call: ({ signal, trpc }) =>
              trpc.workout.skipExercise.mutate(input, { signal }),
            errors: WORKOUT_SKIP_EXERCISE_WIRE_ERRORS,
          });
        },
      );

      /**
       * Asks for notification permission the first time a countdown starts,
       * and replaces the notification of an earlier countdown with
       * `notification`, so only one countdown ever notifies.
       */
      const scheduleCountdownNotification = Effect.fn(
        "WorkoutApplicationService.scheduleCountdownNotification",
      )(function* (notification: ScheduledNotification) {
        const permissionStatus = yield* notifications.getPermissionStatus();

        if (permissionStatus === "undetermined") {
          yield* notifications.requestPermission();
        }

        yield* notifications.cancelAllScheduled();
        yield* notifications.schedule(notification);
      });

      const start = Effect.fn("WorkoutApplicationService.start")(function* (
        input: WorkoutStartInput,
      ) {
        yield* trpcClient.request({
          call: ({ signal, trpc }) =>
            trpc.workout.start.mutate(input, { signal }),
          errors: WORKOUT_START_WIRE_ERRORS,
        });
      });

      /**
       * Stops the Workout, then cancels the notification of its countdown,
       * which has nothing left to count down for.
       */
      const stop = Effect.fn("WorkoutApplicationService.stop")(function* (
        input: WorkoutStopInput,
      ) {
        yield* trpcClient.request({
          call: ({ signal, trpc }) =>
            trpc.workout.stop.mutate(input, { signal }),
          errors: WORKOUT_STOP_WIRE_ERRORS,
        });
        yield* notifications.cancelAllScheduled();
      });

      return WorkoutApplicationService.of({
        cancelCountdownNotification,
        findInProgress,
        removeSet,
        saveNote,
        saveSet,
        scheduleCountdownNotification,
        skipExercise,
        start,
        stop,
      });
    }),
  );

  static readonly layer = WorkoutApplicationService.layerNoDeps.pipe(
    Layer.provide(Layer.mergeAll(Notifications.layer, TrpcClient.layer)),
  );
}
