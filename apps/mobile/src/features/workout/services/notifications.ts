import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ExpoNotifications from "expo-notifications";

type ScheduledNotification = {
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
        scheduleNotification,
      };
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make);
}
