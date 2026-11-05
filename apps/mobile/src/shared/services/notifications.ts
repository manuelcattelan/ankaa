import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ExpoNotifications from "expo-notifications";

export type NotificationPermissionStatus =
  `${ExpoNotifications.PermissionStatus}`;

/**
 * A notification to schedule, with the identifier it's filed under, named
 * after Expo's `NotificationRequest`, which `schedule` turns it into
 * (https://docs.expo.dev/versions/v58.0.0/sdk/notifications/#notificationrequest).
 */
export type NotificationRequest = {
  identifier: string;
  notification: ScheduledNotification;
};

export type ScheduledNotification = {
  body: string;
  seconds: number;
  title: string;
};

export class Notifications extends Context.Service<
  Notifications,
  {
    readonly cancelAllScheduled: () => Effect.Effect<void>;
    readonly cancelScheduled: (identifier: string) => Effect.Effect<void>;
    readonly getPermissionStatus: () => Effect.Effect<NotificationPermissionStatus>;
    readonly requestPermission: () => Effect.Effect<void>;
    readonly schedule: (request: NotificationRequest) => Effect.Effect<void>;
  }
>()("@ankaa/mobile/shared/services/Notifications") {
  static readonly layer = Layer.effect(
    Notifications,
    Effect.sync(() => {
      // Without a handler, a notification that fires while the app is in the
      // foreground also sets the app's badge, which nothing ever clears
      // (https://github.com/expo/expo/pull/49072).
      ExpoNotifications.setNotificationHandler({
        handleNotification: () =>
          Promise.resolve({
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
      });

      function cancelAllScheduled() {
        return Effect.promise(() =>
          ExpoNotifications.cancelAllScheduledNotificationsAsync(),
        );
      }

      function cancelScheduled(identifier: string) {
        return Effect.promise(() =>
          ExpoNotifications.cancelScheduledNotificationAsync(identifier),
        );
      }

      function getPermissionStatus() {
        return Effect.promise(async () => {
          const permission = await ExpoNotifications.getPermissionsAsync();

          return permission.status;
        });
      }

      function requestPermission() {
        return Effect.promise(() =>
          ExpoNotifications.requestPermissionsAsync(),
        ).pipe(Effect.asVoid);
      }

      function schedule({ identifier, notification }: NotificationRequest) {
        return Effect.promise(() =>
          ExpoNotifications.scheduleNotificationAsync({
            content: { body: notification.body, title: notification.title },
            identifier,
            trigger: {
              seconds: notification.seconds,
              type: ExpoNotifications.SchedulableTriggerInputTypes
                .TIME_INTERVAL,
            },
          }),
        ).pipe(Effect.asVoid);
      }

      return Notifications.of({
        cancelAllScheduled,
        cancelScheduled,
        getPermissionStatus,
        requestPermission,
        schedule,
      });
    }),
  );
}
