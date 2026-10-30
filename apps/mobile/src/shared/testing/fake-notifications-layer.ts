import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import type {
  NotificationPermissionStatus,
  ScheduledNotification,
} from "#/shared/services/notifications.ts";

import { Notifications } from "#/shared/services/notifications.ts";

/**
 * Behaves like a device whose User hasn't been asked for notification
 * permission yet, and who grants it when asked. Records the status that each
 * permission request ends with into `permissionRequests`, and keeps each
 * scheduled notification in `scheduledNotifications` until it's canceled.
 */
export function fakeNotificationsLayer({
  permissionRequests = [],
  scheduledNotifications = [],
}: {
  permissionRequests?: NotificationPermissionStatus[];
  scheduledNotifications?: ScheduledNotification[];
}) {
  return Layer.sync(Notifications, () => {
    let permissionStatus: NotificationPermissionStatus = "undetermined";

    return Notifications.of({
      cancelAllScheduled: () =>
        Effect.sync(() => {
          scheduledNotifications.splice(0);
        }),
      getPermissionStatus: () => Effect.sync(() => permissionStatus),
      requestPermission: () =>
        Effect.sync(() => {
          permissionStatus = "granted";
          permissionRequests.push(permissionStatus);
        }),
      schedule: (notification) =>
        Effect.sync(() => {
          scheduledNotifications.push(notification);
        }),
    });
  });
}
