import { mutationOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "#/layer.ts";
import type { ScheduledNotification } from "#/shared/services/notifications.ts";

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
    // Mutations of one scope run one at a time
    // (https://tanstack.com/query/v5/docs/framework/react/guides/mutations#mutation-scopes),
    // so two quick countdowns can't interleave their cancel and schedule and
    // leave both notifications scheduled.
    scope: { id: "countdownNotificationSchedule" },
  });
}
