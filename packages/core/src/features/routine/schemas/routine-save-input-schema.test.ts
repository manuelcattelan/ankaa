import { describe, expect, it } from "@effect/vitest";
import * as Schema from "effect/Schema";

import { routineSaveInputSchema } from "./routine-save-input-schema.ts";

const ROUTINE_EXERCISE_SET = {
  amount: 1,
  dropSetSegmentCount: null,
  dropSetWeightPercentage: null,
  id: "019a0000-0000-7000-8000-000000000031",
  isToFailure: false,
  position: 0,
  restPauseRestSeconds: null,
  restPauseSegmentCount: null,
  restSeconds: 1,
  setType: "working",
  tempo: "3-0-1-2",
  variation: null,
};

const ROUTINE_EXERCISE = {
  exerciseId: "019a0000-0000-7000-8000-000000000021",
  id: "019a0000-0000-7000-8000-000000000011",
  note: null,
  position: 0,
  section: "main",
  sets: [ROUTINE_EXERCISE_SET],
  superset: null,
  warmUpForRoutineExerciseId: null,
};

const SECOND_ROUTINE_EXERCISE = {
  ...ROUTINE_EXERCISE,
  exerciseId: "019a0000-0000-7000-8000-000000000022",
  id: "019a0000-0000-7000-8000-000000000012",
  position: 1,
  sets: [
    { ...ROUTINE_EXERCISE_SET, id: "019a0000-0000-7000-8000-000000000032" },
  ],
};

const ROUTINE_SAVE_INPUT = {
  days: ["monday", "thursday"],
  exercises: [ROUTINE_EXERCISE],
  id: "019a0000-0000-7000-8000-000000000001",
  name: "Push",
};

const decodeRoutineSaveInput = Schema.decodeUnknownSync(routineSaveInputSchema);

describe("routineSaveInputSchema", () => {
  it("accepts a valid Routine", () => {
    expect(decodeRoutineSaveInput(ROUTINE_SAVE_INPUT)).toStrictEqual(
      ROUTINE_SAVE_INPUT,
    );
  });

  it("accepts a name surrounded by spaces and trims them", () => {
    const routineSaveInput = { ...ROUTINE_SAVE_INPUT, name: "  Push  " };

    expect(decodeRoutineSaveInput(routineSaveInput)).toStrictEqual({
      ...ROUTINE_SAVE_INPUT,
      name: "Push",
    });
  });

  it("rejects a name made only of spaces", () => {
    const routineSaveInput = { ...ROUTINE_SAVE_INPUT, name: "   " };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Expected a value with a length of at least 1\n  at ["name"]',
    );
  });

  it("rejects a day listed twice", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      days: ["monday", "thursday", "monday"],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Expected an array with unique items\n  at ["days"]',
    );
  });

  it("rejects two Routine exercises with the same id", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        ROUTINE_EXERCISE,
        { ...SECOND_ROUTINE_EXERCISE, id: ROUTINE_EXERCISE.id },
      ],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Must be unique\n  at ["exercises"]',
    );
  });

  it("rejects two Routine exercises at the same position", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        ROUTINE_EXERCISE,
        { ...SECOND_ROUTINE_EXERCISE, position: 0 },
      ],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Must be unique\n  at ["exercises"]',
    );
  });

  it("rejects two Sets with the same id in different Routine exercises", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        ROUTINE_EXERCISE,
        { ...SECOND_ROUTINE_EXERCISE, sets: [ROUTINE_EXERCISE_SET] },
      ],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Must be unique\n  at ["exercises"]',
    );
  });

  it("accepts a Warm-up exercise that points to another main exercise", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          warmUpForRoutineExerciseId: SECOND_ROUTINE_EXERCISE.id,
        },
        SECOND_ROUTINE_EXERCISE,
      ],
    };

    expect(decodeRoutineSaveInput(routineSaveInput)).toStrictEqual(
      routineSaveInput,
    );
  });

  it("rejects a Warm-up exercise that points to an exercise of another Section", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          warmUpForRoutineExerciseId: SECOND_ROUTINE_EXERCISE.id,
        },
        { ...SECOND_ROUTINE_EXERCISE, section: "cool_down" },
      ],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Must point to another main exercise of the same routine or workout\n  at ["exercises"][0]["warmUpForRoutineExerciseId"]',
    );
  });

  it("accepts the exercises of a Superset at neighboring positions", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        { ...ROUTINE_EXERCISE, superset: 1 },
        { ...SECOND_ROUTINE_EXERCISE, superset: 1 },
      ],
    };

    expect(decodeRoutineSaveInput(routineSaveInput)).toStrictEqual(
      routineSaveInput,
    );
  });

  it("rejects the exercises of a Superset that aren't neighbors", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        { ...ROUTINE_EXERCISE, superset: 1 },
        SECOND_ROUTINE_EXERCISE,
        {
          ...ROUTINE_EXERCISE,
          id: "019a0000-0000-7000-8000-000000000013",
          position: 2,
          sets: [
            {
              ...ROUTINE_EXERCISE_SET,
              id: "019a0000-0000-7000-8000-000000000033",
            },
          ],
          superset: 1,
        },
      ],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'The exercises of a superset must be neighbors\n  at ["exercises"]',
    );
  });

  it("rejects a Routine exercise at position -1", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [{ ...ROUTINE_EXERCISE, position: -1 }],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Expected a value greater than or equal to 0\n  at ["exercises"][0]["position"]',
    );
  });

  it("rejects two Sets of a Routine exercise at the same position", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          sets: [
            ROUTINE_EXERCISE_SET,
            {
              ...ROUTINE_EXERCISE_SET,
              id: "019a0000-0000-7000-8000-000000000032",
            },
          ],
        },
      ],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Must be unique\n  at ["exercises"][0]["sets"]',
    );
  });

  it("rejects a Set with an Amount of 0", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          sets: [{ ...ROUTINE_EXERCISE_SET, amount: 0 }],
        },
      ],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Expected a value greater than or equal to 1\n  at ["exercises"][0]["sets"][0]["amount"]',
    );
  });

  it("rejects a Set at position -1", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          sets: [{ ...ROUTINE_EXERCISE_SET, position: -1 }],
        },
      ],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Expected a value greater than or equal to 0\n  at ["exercises"][0]["sets"][0]["position"]',
    );
  });

  it("rejects a Set with a Rest of 0 seconds", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          sets: [{ ...ROUTINE_EXERCISE_SET, restSeconds: 0 }],
        },
      ],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Expected a value greater than or equal to 1\n  at ["exercises"][0]["sets"][0]["restSeconds"]',
    );
  });

  it("rejects a Set with a Tempo of three numbers", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          sets: [{ ...ROUTINE_EXERCISE_SET, tempo: "3-0-1" }],
        },
      ],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'at ["exercises"][0]["sets"][0]["tempo"]',
    );
  });

  it("accepts a Rest-pause set with pauses of 1 second and 2 Segments", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          sets: [
            {
              ...ROUTINE_EXERCISE_SET,
              restPauseRestSeconds: 1,
              restPauseSegmentCount: 2,
              variation: "rest_pause",
            },
          ],
        },
      ],
    };

    expect(decodeRoutineSaveInput(routineSaveInput)).toStrictEqual(
      routineSaveInput,
    );
  });

  it("rejects a Rest-pause set with pauses of 0 seconds", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          sets: [
            {
              ...ROUTINE_EXERCISE_SET,
              restPauseRestSeconds: 0,
              restPauseSegmentCount: 2,
              variation: "rest_pause",
            },
          ],
        },
      ],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Expected a value greater than or equal to 1\n  at ["exercises"][0]["sets"][0]["restPauseRestSeconds"]',
    );
  });

  it("rejects a Rest-pause set with 1 Segment", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          sets: [
            {
              ...ROUTINE_EXERCISE_SET,
              restPauseRestSeconds: 1,
              restPauseSegmentCount: 1,
              variation: "rest_pause",
            },
          ],
        },
      ],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Expected a value greater than or equal to 2\n  at ["exercises"][0]["sets"][0]["restPauseSegmentCount"]',
    );
  });

  it("rejects a Rest-pause set without its pause seconds", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          sets: [
            {
              ...ROUTINE_EXERCISE_SET,
              restPauseSegmentCount: 2,
              variation: "rest_pause",
            },
          ],
        },
      ],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Must be filled exactly when the variation is rest_pause\n  at ["exercises"][0]["sets"][0]["restPauseRestSeconds"]',
    );
  });

  it("rejects a Rest-pause set without its Segment count", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          sets: [
            {
              ...ROUTINE_EXERCISE_SET,
              restPauseRestSeconds: 1,
              variation: "rest_pause",
            },
          ],
        },
      ],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Must be filled exactly when the variation is rest_pause\n  at ["exercises"][0]["sets"][0]["restPauseSegmentCount"]',
    );
  });

  it("rejects pause seconds on a Set that isn't a Rest-pause set", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          sets: [{ ...ROUTINE_EXERCISE_SET, restPauseRestSeconds: 1 }],
        },
      ],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Must be filled exactly when the variation is rest_pause\n  at ["exercises"][0]["sets"][0]["restPauseRestSeconds"]',
    );
  });

  it("accepts a Drop set with 2 Segments and no weight percentage", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          sets: [
            {
              ...ROUTINE_EXERCISE_SET,
              dropSetSegmentCount: 2,
              variation: "drop_set",
            },
          ],
        },
      ],
    };

    expect(decodeRoutineSaveInput(routineSaveInput)).toStrictEqual(
      routineSaveInput,
    );
  });

  it("accepts a Drop set with a weight percentage of 1", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          sets: [
            {
              ...ROUTINE_EXERCISE_SET,
              dropSetSegmentCount: 2,
              dropSetWeightPercentage: 1,
              variation: "drop_set",
            },
          ],
        },
      ],
    };

    expect(decodeRoutineSaveInput(routineSaveInput)).toStrictEqual(
      routineSaveInput,
    );
  });

  it("accepts a Drop set with a weight percentage of 99", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          sets: [
            {
              ...ROUTINE_EXERCISE_SET,
              dropSetSegmentCount: 2,
              dropSetWeightPercentage: 99,
              variation: "drop_set",
            },
          ],
        },
      ],
    };

    expect(decodeRoutineSaveInput(routineSaveInput)).toStrictEqual(
      routineSaveInput,
    );
  });

  it("rejects a Drop set with 1 Segment", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          sets: [
            {
              ...ROUTINE_EXERCISE_SET,
              dropSetSegmentCount: 1,
              variation: "drop_set",
            },
          ],
        },
      ],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Expected a value greater than or equal to 2\n  at ["exercises"][0]["sets"][0]["dropSetSegmentCount"]',
    );
  });

  it("rejects a Drop set with a weight percentage of 0", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          sets: [
            {
              ...ROUTINE_EXERCISE_SET,
              dropSetSegmentCount: 2,
              dropSetWeightPercentage: 0,
              variation: "drop_set",
            },
          ],
        },
      ],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Expected a value between 1 and 99\n  at ["exercises"][0]["sets"][0]["dropSetWeightPercentage"]',
    );
  });

  it("rejects a Drop set with a weight percentage of 100", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          sets: [
            {
              ...ROUTINE_EXERCISE_SET,
              dropSetSegmentCount: 2,
              dropSetWeightPercentage: 100,
              variation: "drop_set",
            },
          ],
        },
      ],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Expected a value between 1 and 99\n  at ["exercises"][0]["sets"][0]["dropSetWeightPercentage"]',
    );
  });

  it("rejects a Drop set without its Segment count", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          sets: [{ ...ROUTINE_EXERCISE_SET, variation: "drop_set" }],
        },
      ],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Must be filled exactly when the variation is drop_set\n  at ["exercises"][0]["sets"][0]["dropSetSegmentCount"]',
    );
  });

  it("rejects a Segment count on a Set that isn't a Drop set", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          sets: [{ ...ROUTINE_EXERCISE_SET, dropSetSegmentCount: 2 }],
        },
      ],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Must be filled exactly when the variation is drop_set\n  at ["exercises"][0]["sets"][0]["dropSetSegmentCount"]',
    );
  });

  it("rejects a weight percentage on a Set that isn't a Drop set", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      exercises: [
        {
          ...ROUTINE_EXERCISE,
          sets: [{ ...ROUTINE_EXERCISE_SET, dropSetWeightPercentage: 20 }],
        },
      ],
    };

    expect(() => decodeRoutineSaveInput(routineSaveInput)).toThrow(
      'Must be empty unless the variation is drop_set\n  at ["exercises"][0]["sets"][0]["dropSetWeightPercentage"]',
    );
  });
});
