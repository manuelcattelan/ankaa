import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { routineSaveInputSchema } from "#/features/routine/schemas/routine-save-input-schema.ts";

const SET = {
  amount: 8,
  id: "019a0000-0000-7000-8000-000000000401",
  intensityTechnique: null,
  isToFailure: false,
  restSeconds: 120,
  tempo: "3-0-1-2",
  type: "working",
};

const DROP_SET = {
  _tag: "DropSet",
  segmentCount: 3,
  weightPercentage: 20,
};

const REST_PAUSE_SET = {
  _tag: "RestPauseSet",
  pauseSeconds: 15,
  segmentCount: 3,
};

const ROUTINE_EXERCISE = {
  exerciseId: "019a0000-0000-7000-8000-000000000001",
  id: "019a0000-0000-7000-8000-000000000301",
  note: null,
  sets: [SET],
  warmUpExercises: [],
};

const ROUTINE_SAVE_INPUT = {
  days: ["monday", "thursday"],
  id: "019a0000-0000-7000-8000-000000000101",
  name: "Push day",
  sections: {
    coolDown: [],
    main: [
      {
        exercises: [ROUTINE_EXERCISE],
        id: "019a0000-0000-7000-8000-000000000201",
      },
    ],
    warmUp: [],
  },
};

const decodeRoutineSaveInput = Schema.decodeUnknownSync(routineSaveInputSchema);

function withSet(set: Record<string, unknown>) {
  return {
    ...ROUTINE_SAVE_INPUT,
    sections: {
      ...ROUTINE_SAVE_INPUT.sections,
      main: [
        {
          exercises: [{ ...ROUTINE_EXERCISE, sets: [{ ...SET, ...set }] }],
          id: "019a0000-0000-7000-8000-000000000201",
        },
      ],
    },
  };
}

describe("routineSaveInputSchema", () => {
  it("accepts a Routine with a Superset, a Warm-up exercise, a Drop set and a Rest-pause set in every Section", () => {
    const routineSaveInput = {
      ...ROUTINE_SAVE_INPUT,
      sections: {
        coolDown: [
          {
            exercises: [
              {
                exerciseId: "019a0000-0000-7000-8000-000000000003",
                id: "019a0000-0000-7000-8000-000000000305",
                note: "Slowly",
                sets: [
                  {
                    ...SET,
                    id: "019a0000-0000-7000-8000-000000000405",
                    restSeconds: null,
                    tempo: null,
                  },
                ],
              },
            ],
            id: "019a0000-0000-7000-8000-000000000203",
          },
        ],
        main: [
          {
            exercises: [
              {
                ...ROUTINE_EXERCISE,
                sets: [{ ...SET, intensityTechnique: DROP_SET }],
                warmUpExercises: [
                  {
                    exerciseId: "019a0000-0000-7000-8000-000000000003",
                    id: "019a0000-0000-7000-8000-000000000302",
                    note: null,
                    sets: [
                      {
                        ...SET,
                        amount: null,
                        id: "019a0000-0000-7000-8000-000000000402",
                        type: "warm_up",
                      },
                    ],
                  },
                ],
              },
              {
                exerciseId: "019a0000-0000-7000-8000-000000000002",
                id: "019a0000-0000-7000-8000-000000000303",
                note: null,
                sets: [
                  {
                    ...SET,
                    id: "019a0000-0000-7000-8000-000000000403",
                    intensityTechnique: REST_PAUSE_SET,
                    isToFailure: true,
                  },
                ],
                warmUpExercises: [],
              },
            ],
            id: "019a0000-0000-7000-8000-000000000201",
          },
        ],
        warmUp: [
          {
            exercises: [
              {
                exerciseId: "019a0000-0000-7000-8000-000000000003",
                id: "019a0000-0000-7000-8000-000000000304",
                note: null,
                sets: [],
              },
            ],
            id: "019a0000-0000-7000-8000-000000000202",
          },
        ],
      },
    };

    expect(decodeRoutineSaveInput(routineSaveInput)).toStrictEqual(
      routineSaveInput,
    );
  });

  it("trims the name", () => {
    expect(
      decodeRoutineSaveInput({ ...ROUTINE_SAVE_INPUT, name: "  Push day  " }),
    ).toMatchObject({ name: "Push day" });
  });

  it("rejects a name made only of spaces", () => {
    expect(() =>
      decodeRoutineSaveInput({ ...ROUTINE_SAVE_INPUT, name: "   " }),
    ).toThrow("Expected a value with a length of at least 1");
  });

  it("rejects a day listed twice", () => {
    expect(() =>
      decodeRoutineSaveInput({
        ...ROUTINE_SAVE_INPUT,
        days: ["monday", "monday"],
      }),
    ).toThrow("Expected an array with unique items");
  });

  it("rejects two nodes of the tree with the same id", () => {
    expect(() =>
      decodeRoutineSaveInput(
        withSet({ id: "019a0000-0000-7000-8000-000000000301" }),
      ),
    ).toThrow("Expected ids that are unique across the Routine");
  });

  it("rejects a Routine with no Routine exercise in the main Section", () => {
    expect(() =>
      decodeRoutineSaveInput({
        ...ROUTINE_SAVE_INPUT,
        sections: {
          coolDown: [],
          main: [],
          warmUp: [
            {
              exercises: [
                {
                  exerciseId: "019a0000-0000-7000-8000-000000000001",
                  id: "019a0000-0000-7000-8000-000000000301",
                  note: null,
                  sets: [SET],
                },
              ],
              id: "019a0000-0000-7000-8000-000000000201",
            },
          ],
        },
      }),
    ).toThrow("Expected a Routine exercise in the main Section");
  });

  it("rejects an Exercise group with no Routine exercise", () => {
    expect(() =>
      decodeRoutineSaveInput({
        ...ROUTINE_SAVE_INPUT,
        sections: {
          ...ROUTINE_SAVE_INPUT.sections,
          coolDown: [
            { exercises: [], id: "019a0000-0000-7000-8000-000000000202" },
          ],
        },
      }),
    ).toThrow("Expected a value with a length of at least 1");
  });

  it("rejects a Set with an Amount of 0", () => {
    expect(() => decodeRoutineSaveInput(withSet({ amount: 0 }))).toThrow(
      "Expected a value greater than or equal to 1",
    );
  });

  it("rejects a Set with an Amount that isn't a whole number", () => {
    expect(() => decodeRoutineSaveInput(withSet({ amount: 8.5 }))).toThrow(
      "Expected an integer",
    );
  });

  it("rejects a Set with an Amount too large for a PostgreSQL integer", () => {
    expect(() =>
      decodeRoutineSaveInput(withSet({ amount: 2_147_483_648 })),
    ).toThrow("Expected a value less than or equal to 2147483647");
  });

  it("rejects a Set with a Rest of 0 seconds", () => {
    expect(() => decodeRoutineSaveInput(withSet({ restSeconds: 0 }))).toThrow(
      "Expected a value greater than or equal to 1",
    );
  });

  it("rejects a Set with a Tempo of three numbers", () => {
    expect(() => decodeRoutineSaveInput(withSet({ tempo: "3-0-1" }))).toThrow(
      "Expected a string matching the RegExp",
    );
  });

  it("rejects a Drop set with 1 Segment", () => {
    expect(() =>
      decodeRoutineSaveInput(
        withSet({ intensityTechnique: { ...DROP_SET, segmentCount: 1 } }),
      ),
    ).toThrow("Expected a value greater than or equal to 2");
  });

  it("rejects a Drop set with a weight percentage of 100", () => {
    expect(() =>
      decodeRoutineSaveInput(
        withSet({
          intensityTechnique: { ...DROP_SET, weightPercentage: 100 },
        }),
      ),
    ).toThrow("Expected a value between 1 and 99");
  });

  it("accepts a Drop set with no weight percentage", () => {
    expect(
      decodeRoutineSaveInput(
        withSet({
          intensityTechnique: { ...DROP_SET, weightPercentage: null },
        }),
      ),
    ).toMatchObject(
      withSet({ intensityTechnique: { ...DROP_SET, weightPercentage: null } }),
    );
  });

  it("rejects a Drop set without its Segment count", () => {
    expect(() =>
      decodeRoutineSaveInput(
        withSet({
          intensityTechnique: { _tag: "DropSet", weightPercentage: 20 },
        }),
      ),
    ).toThrow("Missing key");
  });

  it("rejects a Rest-pause set with 1 Segment", () => {
    expect(() =>
      decodeRoutineSaveInput(
        withSet({
          intensityTechnique: { ...REST_PAUSE_SET, segmentCount: 1 },
        }),
      ),
    ).toThrow("Expected a value greater than or equal to 2");
  });

  it("rejects a Rest-pause set with a Pause of 0 seconds", () => {
    expect(() =>
      decodeRoutineSaveInput(
        withSet({
          intensityTechnique: { ...REST_PAUSE_SET, pauseSeconds: 0 },
        }),
      ),
    ).toThrow("Expected a value greater than or equal to 1");
  });

  it("rejects a Rest-pause set without its Pause", () => {
    expect(() =>
      decodeRoutineSaveInput(
        withSet({
          intensityTechnique: { _tag: "RestPauseSet", segmentCount: 3 },
        }),
      ),
    ).toThrow("Missing key");
  });
});
