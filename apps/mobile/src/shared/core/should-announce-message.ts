/**
 * Whether the Accessibility Service announces a message: only a non-empty
 * one, on iOS and Android alike.
 */
export function shouldAnnounceMessage({ message }: { message: string }) {
  return message !== "";
}
