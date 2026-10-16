import { MILLISECONDS_PER_SECOND } from "@/shared/constants/time";

type GetRemainingSecondsOptions = {
  currentTime: number;
  deadline: number;
};

export function getRemainingSeconds({
  currentTime,
  deadline,
}: GetRemainingSecondsOptions) {
  return Math.max(
    0,
    Math.ceil((deadline - currentTime) / MILLISECONDS_PER_SECOND),
  );
}
