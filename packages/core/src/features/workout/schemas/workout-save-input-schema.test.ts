import { describe, expect, it } from "@effect/vitest";
import * as Schema from "effect/Schema";

import { workoutSaveInputSchema } from "./workout-save-input-schema.ts";

const WORKOUT_EXERCISE_SET_SEGMENT = {
  amount: 1,
  id: "019a0000-0000-7000-8000-000000000041",
  position: 0,
  weightUnit: "kilogram",
  weightValue: 60,
};

const WORKOUT_EXERCISE_SET = {
  id: "019a0000-0000-7000-8000-000000000031",
  isToFailure: false,
  position: 0,
  segments: [WORKOUT_EXERCISE_SET_SEGMENT],
  setType: "working",
  tempo: "3-0-1-2",
  variation: null,
};

const WORKOUT_EXERCISE = {
  amountUnit: "repetition",
  exerciseId: "019a0000-0000-7000-8000-000000000021",
  id: "019a0000-0000-7000-8000-000000000011",
  note: null,
  position: 0,
  section: "main",
  sets: [WORKOUT_EXERCISE_SET],
  skipReason: null,
  skipReasonNote: null,
  superset: null,
  warmUpForWorkoutExerciseId: null,
  weightType: "total",
};

const SECOND_WORKOUT_EXERCISE = {
  ...WORKOUT_EXERCISE,
  exerciseId: "019a0000-0000-7000-8000-000000000022",
  id: "019a0000-0000-7000-8000-000000000012",
  position: 1,
  sets: [
    {
      ...WORKOUT_EXERCISE_SET,
      id: "019a0000-0000-7000-8000-000000000032",
      segments: [
        {
          ...WORKOUT_EXERCISE_SET_SEGMENT,
          id: "019a0000-0000-7000-8000-000000000042",
        },
      ],
    },
  ],
};

const WORKOUT_SAVE_INPUT = {
  endedAt: null,
  exercises: [WORKOUT_EXERCISE],
  id: "019a0000-0000-7000-8000-000000000001",
  routineId: "019a0000-0000-7000-8000-000000000002",
  startedAt: "2026-10-19T08:30:00Z",
  version: 1,
};

const decodeWorkoutSaveInput = Schema.decodeUnknownSync(workoutSaveInputSchema);

describe("workoutSaveInputSchema", () => {
  it("accepts a valid Workout", () => {
    expect(decodeWorkoutSaveInput(WORKOUT_SAVE_INPUT)).toStrictEqual(
      WORKOUT_SAVE_INPUT,
    );
  });

  it("accepts a start with fractions of a second", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      startedAt: "2026-10-19T08:30:00.123Z",
    };

    expect(decodeWorkoutSaveInput(workoutSaveInput)).toStrictEqual(
      workoutSaveInput,
    );
  });

  it("accepts a start on February 29 of a leap year", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      startedAt: "2024-02-29T08:30:00Z",
    };

    expect(decodeWorkoutSaveInput(workoutSaveInput)).toStrictEqual(
      workoutSaveInput,
    );
  });

  it("accepts a start on February 29 of a century year divisible by 400", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      startedAt: "2000-02-29T08:30:00Z",
    };

    expect(decodeWorkoutSaveInput(workoutSaveInput)).toStrictEqual(
      workoutSaveInput,
    );
  });

  it("rejects a start with an offset other than Z", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      startedAt: "2026-10-19T08:30:00+02:00",
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'at ["startedAt"]',
    );
  });

  it("rejects a start without a time", () => {
    const workoutSaveInput = { ...WORKOUT_SAVE_INPUT, startedAt: "2026-10-19" };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'at ["startedAt"]',
    );
  });

  it("rejects a start on February 29 of a year that isn't a leap year", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      startedAt: "2026-02-29T08:30:00Z",
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'at ["startedAt"]',
    );
  });

  it("rejects a start on February 29 of a century year not divisible by 400", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      startedAt: "1900-02-29T08:30:00Z",
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'at ["startedAt"]',
    );
  });

  it("rejects a start on April 31", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      startedAt: "2026-04-31T08:30:00Z",
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'at ["startedAt"]',
    );
  });

  it("rejects a start at hour 24", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      startedAt: "2026-10-19T24:00:00Z",
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'at ["startedAt"]',
    );
  });

  it("rejects an end without the T between the date and the time", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      endedAt: "2026-10-19 09:30:00Z",
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'at ["endedAt"]',
    );
  });

  it("accepts an end at the same time as the start", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      endedAt: "2026-10-19T08:30:00Z",
    };

    expect(decodeWorkoutSaveInput(workoutSaveInput)).toStrictEqual(
      workoutSaveInput,
    );
  });

  it("rejects an end before the start", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      endedAt: "2026-10-19T08:29:59Z",
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'Must not be before the start\n  at ["endedAt"]',
    );
  });

  it("rejects two Workout exercises with the same id", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [
        WORKOUT_EXERCISE,
        { ...SECOND_WORKOUT_EXERCISE, id: WORKOUT_EXERCISE.id },
      ],
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'Must be unique\n  at ["exercises"]',
    );
  });

  it("rejects two Workout exercises at the same position", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [
        WORKOUT_EXERCISE,
        { ...SECOND_WORKOUT_EXERCISE, position: 0 },
      ],
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'Must be unique\n  at ["exercises"]',
    );
  });

  it("rejects two Sets with the same id in different Workout exercises", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [
        WORKOUT_EXERCISE,
        {
          ...SECOND_WORKOUT_EXERCISE,
          sets: [
            {
              ...WORKOUT_EXERCISE_SET,
              segments: [
                {
                  ...WORKOUT_EXERCISE_SET_SEGMENT,
                  id: "019a0000-0000-7000-8000-000000000042",
                },
              ],
            },
          ],
        },
      ],
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'Must be unique\n  at ["exercises"]',
    );
  });

  it("rejects two Segments with the same id in different Sets", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [
        WORKOUT_EXERCISE,
        {
          ...SECOND_WORKOUT_EXERCISE,
          sets: [
            {
              ...WORKOUT_EXERCISE_SET,
              id: "019a0000-0000-7000-8000-000000000032",
            },
          ],
        },
      ],
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'Must be unique\n  at ["exercises"]',
    );
  });

  it("accepts a Warm-up exercise that points to another main exercise", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [
        {
          ...WORKOUT_EXERCISE,
          warmUpForWorkoutExerciseId: SECOND_WORKOUT_EXERCISE.id,
        },
        SECOND_WORKOUT_EXERCISE,
      ],
    };

    expect(decodeWorkoutSaveInput(workoutSaveInput)).toStrictEqual(
      workoutSaveInput,
    );
  });

  it("rejects a Warm-up exercise that points to an exercise of another Section", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [
        {
          ...WORKOUT_EXERCISE,
          warmUpForWorkoutExerciseId: SECOND_WORKOUT_EXERCISE.id,
        },
        { ...SECOND_WORKOUT_EXERCISE, section: "cool_down" },
      ],
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'Must point to another main exercise of the same routine or workout\n  at ["exercises"][0]["warmUpForWorkoutExerciseId"]',
    );
  });

  it("accepts the exercises of a Superset at neighboring positions", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [
        { ...WORKOUT_EXERCISE, superset: 1 },
        { ...SECOND_WORKOUT_EXERCISE, superset: 1 },
      ],
    };

    expect(decodeWorkoutSaveInput(workoutSaveInput)).toStrictEqual(
      workoutSaveInput,
    );
  });

  it("rejects the exercises of a Superset that aren't neighbors", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [
        { ...WORKOUT_EXERCISE, superset: 1 },
        SECOND_WORKOUT_EXERCISE,
        {
          ...WORKOUT_EXERCISE,
          id: "019a0000-0000-7000-8000-000000000013",
          position: 2,
          sets: [],
          superset: 1,
        },
      ],
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'The exercises of a superset must be neighbors\n  at ["exercises"]',
    );
  });

  it("rejects a Workout exercise at position -1", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [{ ...WORKOUT_EXERCISE, position: -1 }],
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'Expected a value greater than or equal to 0\n  at ["exercises"][0]["position"]',
    );
  });

  it("rejects two Sets of a Workout exercise at the same position", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [
        {
          ...WORKOUT_EXERCISE,
          sets: [
            WORKOUT_EXERCISE_SET,
            {
              ...WORKOUT_EXERCISE_SET,
              id: "019a0000-0000-7000-8000-000000000032",
              segments: [
                {
                  ...WORKOUT_EXERCISE_SET_SEGMENT,
                  id: "019a0000-0000-7000-8000-000000000042",
                },
              ],
            },
          ],
        },
      ],
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'Must be unique\n  at ["exercises"][0]["sets"]',
    );
  });

  it("accepts a Skipped exercise with a skip reason and a note", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [
        {
          ...WORKOUT_EXERCISE,
          skipReason: "pain",
          skipReasonNote: "Sore shoulder",
        },
      ],
    };

    expect(decodeWorkoutSaveInput(workoutSaveInput)).toStrictEqual(
      workoutSaveInput,
    );
  });

  it("rejects a skip note without a skip reason", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [{ ...WORKOUT_EXERCISE, skipReasonNote: "Sore shoulder" }],
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'Must be empty when the skip reason is empty\n  at ["exercises"][0]["skipReasonNote"]',
    );
  });

  it("accepts a Workout exercise whose Weight type is none with Segments without weight", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [
        {
          ...WORKOUT_EXERCISE,
          sets: [
            {
              ...WORKOUT_EXERCISE_SET,
              segments: [
                {
                  ...WORKOUT_EXERCISE_SET_SEGMENT,
                  weightUnit: null,
                  weightValue: null,
                },
              ],
            },
          ],
          weightType: "none",
        },
      ],
    };

    expect(decodeWorkoutSaveInput(workoutSaveInput)).toStrictEqual(
      workoutSaveInput,
    );
  });

  it("rejects a weight on a Segment of a Workout exercise whose Weight type is none", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [
        {
          ...WORKOUT_EXERCISE,
          sets: [
            {
              ...WORKOUT_EXERCISE_SET,
              segments: [
                {
                  ...WORKOUT_EXERCISE_SET_SEGMENT,
                  weightUnit: null,
                  weightValue: null,
                },
              ],
            },
            {
              ...WORKOUT_EXERCISE_SET,
              id: "019a0000-0000-7000-8000-000000000032",
              position: 1,
              segments: [
                {
                  ...WORKOUT_EXERCISE_SET_SEGMENT,
                  id: "019a0000-0000-7000-8000-000000000042",
                  weightUnit: null,
                  weightValue: null,
                },
                {
                  ...WORKOUT_EXERCISE_SET_SEGMENT,
                  id: "019a0000-0000-7000-8000-000000000043",
                  position: 1,
                },
              ],
            },
          ],
          weightType: "none",
        },
      ],
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'Must be empty when the weight type is none\n  at ["exercises"][0]["sets"][1]["segments"][1]["weightValue"]',
    );
  });

  it("rejects a Set at position -1", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [
        {
          ...WORKOUT_EXERCISE,
          sets: [{ ...WORKOUT_EXERCISE_SET, position: -1 }],
        },
      ],
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'Expected a value greater than or equal to 0\n  at ["exercises"][0]["sets"][0]["position"]',
    );
  });

  it("rejects a Set without Segments", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [
        {
          ...WORKOUT_EXERCISE,
          sets: [{ ...WORKOUT_EXERCISE_SET, segments: [] }],
        },
      ],
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'Expected a value with a length of at least 1\n  at ["exercises"][0]["sets"][0]["segments"]',
    );
  });

  it("rejects two Segments of a Set at the same position", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [
        {
          ...WORKOUT_EXERCISE,
          sets: [
            {
              ...WORKOUT_EXERCISE_SET,
              segments: [
                WORKOUT_EXERCISE_SET_SEGMENT,
                {
                  ...WORKOUT_EXERCISE_SET_SEGMENT,
                  id: "019a0000-0000-7000-8000-000000000042",
                },
              ],
            },
          ],
        },
      ],
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'Must be unique\n  at ["exercises"][0]["sets"][0]["segments"]',
    );
  });

  it("rejects a Set with a Tempo of three numbers", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [
        {
          ...WORKOUT_EXERCISE,
          sets: [{ ...WORKOUT_EXERCISE_SET, tempo: "3-0-1" }],
        },
      ],
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'at ["exercises"][0]["sets"][0]["tempo"]',
    );
  });

  it("rejects a Segment with an Amount of 0", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [
        {
          ...WORKOUT_EXERCISE,
          sets: [
            {
              ...WORKOUT_EXERCISE_SET,
              segments: [{ ...WORKOUT_EXERCISE_SET_SEGMENT, amount: 0 }],
            },
          ],
        },
      ],
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'Expected a value greater than or equal to 1\n  at ["exercises"][0]["sets"][0]["segments"][0]["amount"]',
    );
  });

  it("rejects a Segment at position -1", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [
        {
          ...WORKOUT_EXERCISE,
          sets: [
            {
              ...WORKOUT_EXERCISE_SET,
              segments: [{ ...WORKOUT_EXERCISE_SET_SEGMENT, position: -1 }],
            },
          ],
        },
      ],
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'Expected a value greater than or equal to 0\n  at ["exercises"][0]["sets"][0]["segments"][0]["position"]',
    );
  });

  it("rejects a Segment with a weight that isn't a multiple of 0.01", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [
        {
          ...WORKOUT_EXERCISE,
          sets: [
            {
              ...WORKOUT_EXERCISE_SET,
              segments: [
                { ...WORKOUT_EXERCISE_SET_SEGMENT, weightValue: 60.005 },
              ],
            },
          ],
        },
      ],
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'Expected a value that is a multiple of 0.01\n  at ["exercises"][0]["sets"][0]["segments"][0]["weightValue"]',
    );
  });

  it("rejects a Segment with a weight but no weight unit", () => {
    const workoutSaveInput = {
      ...WORKOUT_SAVE_INPUT,
      exercises: [
        {
          ...WORKOUT_EXERCISE,
          sets: [
            {
              ...WORKOUT_EXERCISE_SET,
              segments: [{ ...WORKOUT_EXERCISE_SET_SEGMENT, weightUnit: null }],
            },
          ],
        },
      ],
    };

    expect(() => decodeWorkoutSaveInput(workoutSaveInput)).toThrow(
      'Must be filled when the weight value is filled\n  at ["exercises"][0]["sets"][0]["segments"][0]["weightUnit"]',
    );
  });
});
