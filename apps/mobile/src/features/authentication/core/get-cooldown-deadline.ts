import { MILLISECONDS_PER_SECOND } from "#/shared/constants/milliseconds-per-second.ts";

type GetCooldownDeadlineOptions = {
  seconds: number;
  start: number;
};

export function getCooldownDeadline({
  seconds,
  start,
}: GetCooldownDeadlineOptions) {
  return start + seconds * MILLISECONDS_PER_SECOND;
}
