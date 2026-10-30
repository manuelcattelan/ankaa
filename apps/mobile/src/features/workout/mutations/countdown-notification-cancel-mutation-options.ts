import { mutationOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "#/layer.ts";

import { COUNTDOWN_NOTIFICATION_SCOPE } from "#/features/workout/constants/countdown-notification-scope.ts";
import { WorkoutApplicationService } from "#/features/workout/workout-application-service.ts";

const program = Effect.fn("countdownNotificationCancelMutation")(function* () {
  const workoutApplicationService = yield* WorkoutApplicationService;

  yield* workoutApplicationService.cancelCountdownNotification();
});

export function countdownNotificationCancelMutationOptions(
  runtime: ApplicationRuntime,
) {
  return mutationOptions({
    mutationFn: () => runtime.runPromise(program()),
    scope: COUNTDOWN_NOTIFICATION_SCOPE,
  });
}
