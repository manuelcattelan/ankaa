/**
 * The scope of the mutations that schedule and cancel the notification of a
 * countdown. Mutations of one scope run one at a time
 * (https://tanstack.com/query/v5/docs/framework/react/guides/mutations#mutation-scopes),
 * so a cancel and a schedule can't interleave and leave a notification
 * scheduled.
 */
export const COUNTDOWN_NOTIFICATION_SCOPE = { id: "countdownNotification" };
