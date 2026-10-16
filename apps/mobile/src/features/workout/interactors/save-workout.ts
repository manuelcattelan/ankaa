import type { WorkoutSaveInput } from "@ankaa/core/features/workout/schemas/workout-save-input-schema";

import * as Effect from "effect/Effect";

import { TrpcClient } from "@/shared/services/trpc-client";

export const saveWorkout = Effect.fn("saveWorkout")(function* (
  workoutSaveInput: WorkoutSaveInput,
) {
  const trpcClient = yield* TrpcClient;

  return yield* trpcClient.request((vanillaTrpcClient) =>
    vanillaTrpcClient.workout.save.mutate(workoutSaveInput),
  );
});
