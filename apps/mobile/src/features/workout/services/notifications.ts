import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ExpoNotifications from "expo-notifications";

export type ScheduledNotification = {
  body: string;
  delaySeconds: number;
  title: string;
};

export class Notifications extends Context.Service<Notifications>()(
  "@ankaa/mobile/features/workout/services/Notifications",
  {
    make: Effect.sync(() => {
      function cancelScheduledNotification(notificationId: string) {
        return Effect.promise(() =>
          ExpoNotifications.cancelScheduledNotificationAsync(notificationId),
        );
      }

      function checkNotificationPermission() {
        return Effect.promise(async () => {
          const notificationPermission =
            await ExpoNotifications.getPermissionsAsync();

          return notificationPermission.granted;
        });
      }

      function requestNotificationPermission() {
        return Effect.promise(async () => {
          const notificationPermission =
            await ExpoNotifications.getPermissionsAsync();

          if (
            notificationPermission.status ===
            ExpoNotifications.PermissionStatus.UNDETERMINED
          ) {
            await ExpoNotifications.requestPermissionsAsync();
          }
        });
      }

      function scheduleNotification({
        body,
        delaySeconds,
        title,
      }: ScheduledNotification) {
        return Effect.promise(() =>
          ExpoNotifications.scheduleNotificationAsync({
            content: { body, title },
            trigger: {
              seconds: delaySeconds,
              type: ExpoNotifications.SchedulableTriggerInputTypes
                .TIME_INTERVAL,
            },
          }),
        );
      }

      return {
        cancelScheduledNotification,
        checkNotificationPermission,
        requestNotificationPermission,
        scheduleNotification,
      };
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make);

  static readonly layerTest = (
    scheduledNotifications: Map<string, ScheduledNotification>,
  ) =>
    Layer.sync(this, () => {
      let scheduledNotificationCount = 0;

      function cancelScheduledNotification(notificationId: string) {
        return Effect.sync(() => {
          scheduledNotifications.delete(notificationId);
        });
      }

      function scheduleNotification(
        scheduledNotification: ScheduledNotification,
      ) {
        return Effect.sync(() => {
          scheduledNotificationCount += 1;

          const notificationId = `notification-${scheduledNotificationCount}`;

          scheduledNotifications.set(notificationId, scheduledNotification);

          return notificationId;
        });
      }

      return this.of({
        cancelScheduledNotification,
        checkNotificationPermission: () => Effect.succeed(true),
        requestNotificationPermission: () => Effect.void,
        scheduleNotification,
      });
    });
}
