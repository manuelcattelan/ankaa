/**
 * Whether the Accessibility Service announces a message: only a non-empty
 * one.
 */
export function shouldAnnounceMessage({ message }: { message: string }) {
  return message !== "";
}
