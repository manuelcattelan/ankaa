import { isEveryWorkoutExerciseDone } from "#/features/workout/core/is-every-workout-exercise-done.ts";

const DONE_WORKOUT_EXERCISE = {
  plannedSets: [{ type: "working" as const }],
  recordedSets: [{ id: "recorded-set-1" }],
  skipReason: null,
};

const NOT_DONE_WORKOUT_EXERCISE = {
  plannedSets: [{ type: "working" as const }],
  recordedSets: [],
  skipReason: null,
};

describe("isEveryWorkoutExerciseDone", () => {
  it("tells that every Workout exercise is done when each one of every Section has its Working sets recorded or a Skip", () => {
    expect(
      isEveryWorkoutExerciseDone({
        sections: {
          coolDown: [{ exercises: [DONE_WORKOUT_EXERCISE] }],
          main: [
            {
              exercises: [
                {
                  ...NOT_DONE_WORKOUT_EXERCISE,
                  skipReason: "pain",
                  warmUpExercises: [DONE_WORKOUT_EXERCISE],
                },
              ],
            },
          ],
          warmUp: [{ exercises: [DONE_WORKOUT_EXERCISE] }],
        },
      }),
    ).toBe(true);
  });

  it("tells that not every Workout exercise is done when a Warm-up exercise isn't", () => {
    expect(
      isEveryWorkoutExerciseDone({
        sections: {
          coolDown: [],
          main: [
            {
              exercises: [
                {
                  ...DONE_WORKOUT_EXERCISE,
                  warmUpExercises: [NOT_DONE_WORKOUT_EXERCISE],
                },
              ],
            },
          ],
          warmUp: [],
        },
      }),
    ).toBe(false);
  });

  it("tells that not every Workout exercise is done when one of the cool-down Section isn't", () => {
    expect(
      isEveryWorkoutExerciseDone({
        sections: {
          coolDown: [{ exercises: [NOT_DONE_WORKOUT_EXERCISE] }],
          main: [],
          warmUp: [],
        },
      }),
    ).toBe(false);
  });
});
