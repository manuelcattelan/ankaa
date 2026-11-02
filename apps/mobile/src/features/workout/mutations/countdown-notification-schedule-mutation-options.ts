import { mutationOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "#/layer.ts";
import type { ScheduledNotification } from "#/shared/services/notifications.ts";

import { COUNTDOWN_NOTIFICATION_SCOPE } from "#/features/workout/constants/countdown-notification-scope.ts";
import { WorkoutApplicationService } from "#/features/workout/workout-application-service.ts";

const program = Effect.fn("countdownNotificationScheduleMutation")(function* (
  notification: ScheduledNotification,
) {
  const workoutApplicationService = yield* WorkoutApplicationService;

  yield* workoutApplicationService.scheduleCountdownNotification(notification);
});

export function countdownNotificationScheduleMutationOptions(
  runtime: ApplicationRuntime,
) {
  return mutationOptions({
    mutationFn: (notification: ScheduledNotification) =>
      runtime.runPromise(program(notification)),
    scope: COUNTDOWN_NOTIFICATION_SCOPE,
  });
}
