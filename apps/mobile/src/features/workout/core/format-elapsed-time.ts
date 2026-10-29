const SECONDS_PER_MINUTE = 60;

const MINUTES_PER_HOUR = 60;

const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;

const ELAPSED_TIME_PART_LENGTH = 2;

/**
 * Writes `elapsedSeconds` as hours, minutes and seconds, such as 1:01:01,
 * with the minutes and seconds padded to two digits.
 */
export function formatElapsedTime(elapsedSeconds: number) {
  const hours = Math.floor(elapsedSeconds / SECONDS_PER_HOUR);
  const minutes =
    Math.floor(elapsedSeconds / SECONDS_PER_MINUTE) % MINUTES_PER_HOUR;
  const seconds = elapsedSeconds % SECONDS_PER_MINUTE;

  return `${String(hours)}:${padElapsedTimePart(minutes)}:${padElapsedTimePart(seconds)}`;
}

function padElapsedTimePart(elapsedTimePart: number) {
  return String(elapsedTimePart).padStart(ELAPSED_TIME_PART_LENGTH, "0");
}
