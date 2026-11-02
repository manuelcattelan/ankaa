/**
 * A countdown of the Rest after a Set, of a Pause inside a Rest-pause set, or
 * a Segment timer, started at `startTime` under the Set at `position` of a
 * Workout exercise. Rest and a Pause count down `seconds`. A Segment timer
 * counts down `seconds` once its lead-in of `leadInSeconds` ends, or counts
 * up when `seconds` is `null`, as it does when its Set has no planned Amount,
 * and fills in the Segment at `segmentPosition` of the Set's Draft. It lives
 * only in the device's memory.
 */
export type Countdown = (
  | { kind: "pause" | "rest"; seconds: number }
  | {
      kind: "segmentTimer";
      leadInSeconds: number;
      seconds: null | number;
      segmentPosition: number;
    }
) & {
  position: number;
  startTime: number;
  workoutExerciseId: string;
};
