import type { SegmentCountInvalidError } from "@ankaa/core/features/workout/errors/segment-count-invalid-error";
import type { SegmentWeightNotAllowedError } from "@ankaa/core/features/workout/errors/segment-weight-not-allowed-error";
import type { SetNotPlannedError } from "@ankaa/core/features/workout/errors/set-not-planned-error";
import type { SkipConflictError } from "@ankaa/core/features/workout/errors/skip-conflict-error";
import type { SkipReasonMissingError } from "@ankaa/core/features/workout/errors/skip-reason-missing-error";
import type { WorkoutInProgressConflictError } from "@ankaa/core/features/workout/errors/workout-in-progress-conflict-error";
import type { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";
import type { WorkoutRemoveSetInput } from "@ankaa/core/features/workout/schemas/workout-remove-set-input-schema";
import type { WorkoutSaveNoteInput } from "@ankaa/core/features/workout/schemas/workout-save-note-input-schema";
import type { WorkoutSaveSetInput } from "@ankaa/core/features/workout/schemas/workout-save-set-input-schema";
import type { WorkoutSaveSkipInput } from "@ankaa/core/features/workout/schemas/workout-save-skip-input-schema";
import type { WorkoutStartInput } from "@ankaa/core/features/workout/schemas/workout-start-input-schema";
import type { WorkoutStopInput } from "@ankaa/core/features/workout/schemas/workout-stop-input-schema";
import type { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";

import { WORKOUT_REMOVE_SET_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-remove-set-wire-errors";
import { WORKOUT_SAVE_NOTE_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-save-note-wire-errors";
import { WORKOUT_SAVE_SET_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-save-set-wire-errors";
import { WORKOUT_SAVE_SKIP_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-save-skip-wire-errors";
import { WORKOUT_START_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-start-wire-errors";
import { WORKOUT_STOP_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-stop-wire-errors";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { constUndefined } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Struct from "effect/Struct";

import type { CountdownNotifications } from "#/features/workout/core/countdown-notifications.ts";
import type { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";
import type { Workout } from "#/shared/workout.ts";

import { Notifications } from "#/shared/services/notifications.ts";
import { TrpcClient } from "#/shared/services/trpc-client.ts";

/**
 * The identifiers that the notifications of a countdown are scheduled under,
 * one for the end of its lead-in and one for its end, so the Workout cancels
 * only its own notifications and leaves any other one scheduled. They're
 * scheduled in the order of their keys, which is the order they fire in.
 */
const COUNTDOWN_NOTIFICATION_IDENTIFIERS = {
  leadInEnd: "countdownLeadIn",

  end: "countdown",
};

export class WorkoutApplicationService extends Context.Service<
  WorkoutApplicationService,
  {
    readonly cancelCountdownNotifications: () => Effect.Effect<void>;
    readonly findInProgress: () => Effect.Effect<
      null | Workout,
      TrpcClientError
    >;
    readonly removeSet: (
      input: WorkoutRemoveSetInput,
    ) => Effect.Effect<
      void,
      SkipConflictError | TrpcClientError | WorkoutNotFoundError
    >;
    readonly saveNote: (
      input: WorkoutSaveNoteInput,
    ) => Effect.Effect<void, TrpcClientError | WorkoutNotFoundError>;
    readonly saveSet: (
      input: WorkoutSaveSetInput,
    ) => Effect.Effect<
      void,
      | SegmentCountInvalidError
      | SegmentWeightNotAllowedError
      | SetNotPlannedError
      | SkipConflictError
      | TrpcClientError
      | WorkoutNotFoundError
    >;
    readonly saveSkip: (
      input: WorkoutSaveSkipInput,
    ) => Effect.Effect<void, TrpcClientError | WorkoutNotFoundError>;
    readonly scheduleCountdownNotifications: (
      countdownNotifications: CountdownNotifications,
    ) => Effect.Effect<void>;
    readonly start: (
      input: WorkoutStartInput,
    ) => Effect.Effect<
      void,
      RoutineNotFoundError | TrpcClientError | WorkoutInProgressConflictError
    >;
    readonly stop: (
      input: WorkoutStopInput,
    ) => Effect.Effect<
      void,
      SkipReasonMissingError | TrpcClientError | WorkoutNotFoundError
    >;
  }
>()("@ankaa/mobile/features/workout/WorkoutApplicationService") {
  static readonly layerNoDeps = Layer.effect(
    WorkoutApplicationService,
    Effect.gen(function* () {
      const notifications = yield* Notifications;
      const trpcClient = yield* TrpcClient;

      /**
       * Cancels the notifications of the countdown, so a countdown that the
       * User stops, or that has nothing left to count down for, doesn't
       * notify.
       */
      const cancelCountdownNotifications = Effect.fn(
        "WorkoutApplicationService.cancelCountdownNotifications",
      )(function* () {
        yield* Effect.forEach(
          Object.values(COUNTDOWN_NOTIFICATION_IDENTIFIERS),
          (identifier) => notifications.cancelScheduled(identifier),
          { discard: true },
        );
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

      const saveSkip = Effect.fn("WorkoutApplicationService.saveSkip")(
        function* (input: WorkoutSaveSkipInput) {
          yield* trpcClient.request({
            call: ({ signal, trpc }) =>
              trpc.workout.saveSkip.mutate(input, { signal }),
            errors: WORKOUT_SAVE_SKIP_WIRE_ERRORS,
          });
        },
      );

      /**
       * Asks for notification permission the first time a countdown starts,
       * and replaces the notifications of an earlier countdown with those of
       * the countdown started, so only one countdown ever notifies. Both are
       * scheduled at once, because the app may not run when its lead-in ends.
       */
      const scheduleCountdownNotifications = Effect.fn(
        "WorkoutApplicationService.scheduleCountdownNotifications",
      )(function* (countdownNotifications: CountdownNotifications) {
        const permissionStatus = yield* notifications.getPermissionStatus();

        if (permissionStatus === "undetermined") {
          yield* notifications.requestPermission();
        }

        yield* cancelCountdownNotifications();

        yield* Effect.forEach(
          Struct.keys(COUNTDOWN_NOTIFICATION_IDENTIFIERS),
          (key) => {
            const notification = countdownNotifications[key];

            return notification === null
              ? Effect.void
              : notifications.schedule({
                  identifier: COUNTDOWN_NOTIFICATION_IDENTIFIERS[key],
                  notification,
                });
          },
          { discard: true },
        );
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
       * Stops the Workout, then cancels the notifications of its countdown,
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
        yield* cancelCountdownNotifications();
      });

      return WorkoutApplicationService.of({
        cancelCountdownNotifications,
        findInProgress,
        removeSet,
        saveNote,
        saveSet,
        saveSkip,
        scheduleCountdownNotifications,
        start,
        stop,
      });
    }),
  );

  static readonly layer = WorkoutApplicationService.layerNoDeps.pipe(
    Layer.provide(Layer.mergeAll(Notifications.layer, TrpcClient.layer)),
  );
}
