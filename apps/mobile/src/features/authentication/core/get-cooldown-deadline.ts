import { MILLISECONDS_PER_SECOND } from "#/shared/constants/milliseconds-per-second.ts";

type GetCooldownDeadlineOptions = {
  cooldownSeconds: number;
  cooldownStart: number;
};

export function getCooldownDeadline({
  cooldownSeconds,
  cooldownStart,
}: GetCooldownDeadlineOptions) {
  return cooldownStart + cooldownSeconds * MILLISECONDS_PER_SECOND;
}
