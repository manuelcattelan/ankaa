import type { ScheduledNotification } from "#/shared/services/notifications.ts";

/**
 * The notifications of a countdown: one for its end when it counts down, and
 * one for the end of its lead-in when it has one.
 */
export type CountdownNotifications = {
  end: null | ScheduledNotification;
  leadInEnd: null | ScheduledNotification;
};
