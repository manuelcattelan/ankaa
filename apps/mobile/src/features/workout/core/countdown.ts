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
