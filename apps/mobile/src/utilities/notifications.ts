import * as ExpoNotifications from "expo-notifications";

import { messages } from "@/utilities/messages";

type CancelRestNotificationOptions = {
  restNotificationId: string;
};

type ScheduleRestNotificationOptions = {
  restSeconds: number;
};

export function cancelRestNotification({
  restNotificationId,
}: CancelRestNotificationOptions) {
  return ExpoNotifications.cancelScheduledNotificationAsync(restNotificationId);
}

export function scheduleRestNotification({
  restSeconds,
}: ScheduleRestNotificationOptions) {
  return ExpoNotifications.scheduleNotificationAsync({
    content: {
      body: messages.restNotification.body,
      title: messages.restNotification.title,
    },
    trigger: {
      seconds: restSeconds,
      type: ExpoNotifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    },
  });
}
