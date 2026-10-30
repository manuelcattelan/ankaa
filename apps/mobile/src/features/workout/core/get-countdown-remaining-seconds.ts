import { MILLISECONDS_PER_SECOND } from "#/features/workout/constants/milliseconds-per-second.ts";

/**
 * A countdown of the Rest after a Set, or of a Pause inside a Rest-pause set,
 * started under the Set at `position` of a Workout exercise. It lives only in
 * the device's memory.
 */
export type Countdown = {
  kind: "pause" | "rest";
  position: number;
  seconds: number;
  startTime: number;
  workoutExerciseId: string;
};

/**
 * Gives the whole seconds left in `countdown` at `currentTime`, counting a
 * second as left until it has fully passed, and 0 once the countdown has
 * ended.
 */
export function getCountdownRemainingSeconds({
  countdown,
  currentTime,
}: {
  countdown: Countdown;
  currentTime: number;
}) {
  const passedSeconds = Math.floor(
    (currentTime - countdown.startTime) / MILLISECONDS_PER_SECOND,
  );

  return Math.max(countdown.seconds - passedSeconds, 0);
}
