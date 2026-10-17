import * as Effect from "effect/Effect";

import { Notifications } from "@/features/workout/services/notifications";

export const requestNotificationPermission = Effect.fn(
  "requestNotificationPermission",
)(function* () {
  const notifications = yield* Notifications;

  yield* notifications.requestNotificationPermission();
});
