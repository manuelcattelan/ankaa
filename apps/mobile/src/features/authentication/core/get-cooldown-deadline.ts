import { MILLISECONDS_PER_SECOND } from "#/shared/constants/milliseconds-per-second.ts";

export function getCooldownDeadline({
  seconds,
  start,
}: {
  seconds: number;
  start: number;
}) {
  return start + seconds * MILLISECONDS_PER_SECOND;
}
