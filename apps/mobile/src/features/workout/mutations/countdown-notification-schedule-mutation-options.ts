import { mutationOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { CountdownNotifications } from "#/features/workout/workout-application-service.ts";
import type { ApplicationRuntime } from "#/layer.ts";

import { COUNTDOWN_NOTIFICATION_SCOPE } from "#/features/workout/constants/countdown-notification-scope.ts";
import { WorkoutApplicationService } from "#/features/workout/workout-application-service.ts";

const program = Effect.fn("countdownNotificationScheduleMutation")(function* (
  countdownNotifications: CountdownNotifications,
) {
  const workoutApplicationService = yield* WorkoutApplicationService;

  yield* workoutApplicationService.scheduleCountdownNotifications(
    countdownNotifications,
  );
});

export function countdownNotificationScheduleMutationOptions(
  runtime: ApplicationRuntime,
) {
  return mutationOptions({
    mutationFn: (countdownNotifications: CountdownNotifications) =>
      runtime.runPromise(program(countdownNotifications)),
    scope: COUNTDOWN_NOTIFICATION_SCOPE,
  });
}
