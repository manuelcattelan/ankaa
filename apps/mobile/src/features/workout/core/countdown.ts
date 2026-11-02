/**
 * A countdown of the Rest after a Set, of a Pause inside a Rest-pause set, or
 * of a Segment timer, started under the Set at `position` of a Workout
 * exercise, which counts down `seconds` once its lead-in of `leadInSeconds`
 * ends, or counts up when `seconds` is `null`, as a Segment timer does when
 * its Set has no planned Amount. A Segment timer fills in the Segment at
 * `segmentPosition` of the Set's Draft, which is `null` for Rest and a Pause.
 * It lives only in the device's memory.
 */
export type Countdown = {
  kind: "pause" | "rest" | "segmentTimer";
  leadInSeconds: number;
  position: number;
  seconds: null | number;
  segmentPosition: null | number;
  startTime: number;
  workoutExerciseId: string;
};
