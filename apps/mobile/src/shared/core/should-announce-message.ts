type ShouldAnnounceMessageOptions = {
  message: string;
  platform: string;
};

/**
 * Whether the Accessibility Service announces a message: only a non-empty
 * one, and only on iOS.
 */
export function shouldAnnounceMessage({
  message,
  platform,
}: ShouldAnnounceMessageOptions) {
  return message !== "" && platform === "ios";
}
