import type { AppRouter } from "@ankaa/api/trpc/app-router";
import type { WorkoutInProgressConflictError } from "@ankaa/core/features/workout/errors/workout-in-progress-conflict-error";
import type { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";
import type { WorkoutStartInput } from "@ankaa/core/features/workout/schemas/workout-start-input-schema";
import type { WorkoutStopInput } from "@ankaa/core/features/workout/schemas/workout-stop-input-schema";
import type { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";
import type { inferRouterOutputs } from "@trpc/server";

import { WORKOUT_START_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-start-wire-errors";
import { WORKOUT_STOP_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-stop-wire-errors";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { constUndefined } from "effect/Function";
import * as Layer from "effect/Layer";

import type { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

import { TrpcClient } from "#/shared/services/trpc-client.ts";

export type Workout = NonNullable<
  inferRouterOutputs<AppRouter>["workout"]["findInProgress"]
>;

export class WorkoutApplicationService extends Context.Service<
  WorkoutApplicationService,
  {
    readonly findInProgress: () => Effect.Effect<
      null | Workout,
      TrpcClientError
    >;
    readonly start: (
      input: WorkoutStartInput,
    ) => Effect.Effect<
      void,
      RoutineNotFoundError | TrpcClientError | WorkoutInProgressConflictError
    >;
    readonly stop: (
      input: WorkoutStopInput,
    ) => Effect.Effect<void, TrpcClientError | WorkoutNotFoundError>;
  }
>()("@ankaa/mobile/features/workout/WorkoutApplicationService") {
  static readonly layerNoDeps = Layer.effect(
    WorkoutApplicationService,
    Effect.gen(function* () {
      const trpcClient = yield* TrpcClient;

      const findInProgress = Effect.fn(
        "WorkoutApplicationService.findInProgress",
      )(function* () {
        return yield* trpcClient.request({
          call: ({ signal, trpc }) =>
            trpc.workout.findInProgress.query(constUndefined(), { signal }),
          errors: [],
        });
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

      const stop = Effect.fn("WorkoutApplicationService.stop")(function* (
        input: WorkoutStopInput,
      ) {
        yield* trpcClient.request({
          call: ({ signal, trpc }) =>
            trpc.workout.stop.mutate(input, { signal }),
          errors: WORKOUT_STOP_WIRE_ERRORS,
        });
      });

      return WorkoutApplicationService.of({ findInProgress, start, stop });
    }),
  );

  static readonly layer = WorkoutApplicationService.layerNoDeps.pipe(
    Layer.provide(TrpcClient.layer),
  );
}
