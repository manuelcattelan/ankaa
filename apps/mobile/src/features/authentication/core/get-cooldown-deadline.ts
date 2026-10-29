import { MILLISECONDS_PER_SECOND } from "#/shared/constants/time.ts";

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
