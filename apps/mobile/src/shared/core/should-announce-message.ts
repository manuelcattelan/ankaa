/**
 * Whether the Accessibility Service announces a message: only a non-empty
 * one, and only on iOS.
 */
export function shouldAnnounceMessage({
  message,
  platform,
}: {
  message: string;
  platform: string;
}) {
  return message !== "" && platform === "ios";
}
