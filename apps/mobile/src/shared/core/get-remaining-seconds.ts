import { MILLISECONDS_PER_SECOND } from "#/shared/constants/milliseconds-per-second.ts";

export function getRemainingSeconds({
  currentTime,
  deadline,
}: {
  currentTime: number;
  deadline: number;
}) {
  return Math.max(
    0,
    Math.ceil((deadline - currentTime) / MILLISECONDS_PER_SECOND),
  );
}
