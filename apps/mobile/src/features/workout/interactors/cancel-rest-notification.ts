import * as Effect from "effect/Effect";

import type { WorkoutDocumentRestTimer } from "@/features/workout/core/workout-document-schema";

import { Notifications } from "@/features/workout/services/notifications";

export const cancelRestNotification = Effect.fn("cancelRestNotification")(
  function* (restTimer: undefined | WorkoutDocumentRestTimer) {
    const notifications = yield* Notifications;

    if (restTimer?.restNotificationId === undefined) {
      return;
    }

    yield* notifications.cancelScheduledNotification(
      restTimer.restNotificationId,
    );
  },
);
