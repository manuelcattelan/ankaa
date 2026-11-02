/**
 * A countdown of the Rest after a Set, of a Pause inside a Rest-pause set, or
 * of a Segment timer, started under the Set at `position` of a Workout
 * exercise, which counts down `seconds` once its lead-in of `leadInSeconds`
 * ends. It lives only in the device's memory.
 */
export type Countdown = {
  kind: "pause" | "rest" | "segmentTimer";
  leadInSeconds: number;
  position: number;
  seconds: number;
  startTime: number;
  workoutExerciseId: string;
};
