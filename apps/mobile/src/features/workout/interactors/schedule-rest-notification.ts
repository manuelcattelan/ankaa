import * as Effect from "effect/Effect";

import { restNotificationMessages } from "@/features/workout/messages/rest-notification-messages";
import { Notifications } from "@/features/workout/services/notifications";

export const scheduleRestNotification = Effect.fn("scheduleRestNotification")(
  function* (restSeconds: number) {
    const notifications = yield* Notifications;

    const hasNotificationPermission =
      yield* notifications.checkNotificationPermission();

    if (!hasNotificationPermission) {
      return undefined;
    }

    return yield* notifications.scheduleNotification({
      body: restNotificationMessages.body,
      delaySeconds: restSeconds,
      title: restNotificationMessages.title,
    });
  },
);
