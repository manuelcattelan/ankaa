const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;
const ELAPSED_TIME_PART_LENGTH = 2;

export function formatElapsedTime(elapsedSeconds: number) {
  const elapsedHours = Math.floor(elapsedSeconds / SECONDS_PER_HOUR);
  const elapsedMinutes =
    Math.floor(elapsedSeconds / SECONDS_PER_MINUTE) % MINUTES_PER_HOUR;
  const elapsedSecondsOfMinute = elapsedSeconds % SECONDS_PER_MINUTE;

  return `${elapsedHours}:${formatElapsedTimePart(elapsedMinutes)}:${formatElapsedTimePart(elapsedSecondsOfMinute)}`;
}

function formatElapsedTimePart(elapsedTimePart: number) {
  return elapsedTimePart.toString().padStart(ELAPSED_TIME_PART_LENGTH, "0");
}
