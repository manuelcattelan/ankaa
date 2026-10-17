import { MILLISECONDS_PER_SECOND } from "@/shared/constants/time";

type GetElapsedSecondsOptions = {
  currentTime: number;
  startedAt: string;
};

export function getElapsedSeconds({
  currentTime,
  startedAt,
}: GetElapsedSecondsOptions) {
  return Math.max(
    0,
    Math.floor((currentTime - Date.parse(startedAt)) / MILLISECONDS_PER_SECOND),
  );
}
