import { MILLISECONDS_PER_SECOND } from "#/features/workout/constants/milliseconds-per-second.ts";

/**
 * Gives the whole seconds from `startedAt`, the time the server stamped on
 * the Workout's start, to `currentTime`, and 0 before the start.
 */
export function getElapsedSeconds({
  currentTime,
  startedAt,
}: {
  currentTime: number;
  startedAt: string;
}) {
  return Math.max(
    Math.floor((currentTime - Date.parse(startedAt)) / MILLISECONDS_PER_SECOND),
    0,
  );
}
