import * as Schema from "effect/Schema";

import { routineFormSchema } from "#/features/routine/core/routine-form-schema.ts";

const ROUTINE = {
  days: ["monday"],
  id: "01900000-0000-7000-8000-000000000101",
  name: "Push day",
  sections: {
    coolDown: [],
    main: [
      {
        exercises: [
          {
            exerciseId: "01900000-0000-7000-8000-000000000001",
            id: "01900000-0000-7000-8000-000000000301",
            note: "Pause at the chest",
            sets: [
              {
                amount: 8,
                id: "01900000-0000-7000-8000-000000000401",
                intensityTechnique: {
                  _tag: "DropSet",
                  segmentCount: 3,
                  weightPercentage: null,
                },
                isToFailure: false,
                restSeconds: 120,
                tempo: "3-0-X-2",
                type: "working",
              },
            ],
            warmUpExercises: [
              {
                exerciseId: "01900000-0000-7000-8000-000000000003",
                id: "01900000-0000-7000-8000-000000000302",
                note: null,
                sets: [
                  {
                    amount: null,
                    id: "01900000-0000-7000-8000-000000000402",
                    intensityTechnique: null,
                    isToFailure: false,
                    restSeconds: null,
                    tempo: null,
                    type: "warm_up",
                  },
                ],
              },
            ],
          },
          {
            exerciseId: "01900000-0000-7000-8000-000000000002",
            id: "01900000-0000-7000-8000-000000000303",
            note: null,
            sets: [
              {
                amount: 6,
                id: "01900000-0000-7000-8000-000000000403",
                intensityTechnique: {
                  _tag: "RestPauseSet",
                  pauseSeconds: 15,
                  segmentCount: 3,
                },
                isToFailure: true,
                restSeconds: 90,
                tempo: null,
                type: "working",
              },
            ],
            warmUpExercises: [],
          },
        ],
        id: "01900000-0000-7000-8000-000000000201",
      },
    ],
    warmUp: [],
  },
};

const ROUTINE_DRAFT = {
  days: ["monday"],
  id: "01900000-0000-7000-8000-000000000101",
  name: "Push day",
  sections: {
    coolDown: [],
    main: [
      {
        exercises: [
          {
            exerciseId: "01900000-0000-7000-8000-000000000001",
            id: "01900000-0000-7000-8000-000000000301",
            note: "Pause at the chest",
            sets: [
              {
                amount: "8",
                id: "01900000-0000-7000-8000-000000000401",
                intensityTechnique: {
                  _tag: "DropSet",
                  segmentCount: "3",
                  weightPercentage: "",
                },
                isToFailure: false,
                restSeconds: "120",
                tempo: "3-0-X-2",
                type: "working",
              },
            ],
            warmUpExercises: [
              {
                exerciseId: "01900000-0000-7000-8000-000000000003",
                id: "01900000-0000-7000-8000-000000000302",
                note: "",
                sets: [
                  {
                    amount: "",
                    id: "01900000-0000-7000-8000-000000000402",
                    intensityTechnique: null,
                    isToFailure: false,
                    restSeconds: "",
                    tempo: "",
                    type: "warm_up",
                  },
                ],
              },
            ],
          },
          {
            exerciseId: "01900000-0000-7000-8000-000000000002",
            id: "01900000-0000-7000-8000-000000000303",
            note: "",
            sets: [
              {
                amount: "6",
                id: "01900000-0000-7000-8000-000000000403",
                intensityTechnique: {
                  _tag: "RestPauseSet",
                  pauseSeconds: "15",
                  segmentCount: "3",
                },
                isToFailure: true,
                restSeconds: "90",
                tempo: "",
                type: "working",
              },
            ],
            warmUpExercises: [],
          },
        ],
        id: "01900000-0000-7000-8000-000000000201",
      },
    ],
    warmUp: [],
  },
};

const ROUTINE_SET_DRAFT = ROUTINE_DRAFT.sections.main[0]?.exercises[0]?.sets[0];

const decodeRoutineDraft = Schema.decodeUnknownSync(routineFormSchema);

const encodeRoutine = Schema.encodeUnknownSync(routineFormSchema);

function withSetDraft(setDraft: Record<string, unknown>) {
  return {
    ...ROUTINE_DRAFT,
    sections: {
      ...ROUTINE_DRAFT.sections,
      main: [
        {
          exercises: [
            {
              exerciseId: "01900000-0000-7000-8000-000000000001",
              id: "01900000-0000-7000-8000-000000000301",
              note: "",
              sets: [{ ...ROUTINE_SET_DRAFT, ...setDraft }],
              warmUpExercises: [],
            },
          ],
          id: "01900000-0000-7000-8000-000000000201",
        },
      ],
    },
  };
}

describe("routineFormSchema", () => {
  it("encodes a Routine to a Draft that holds every number as text and every empty value as empty text", () => {
    expect(encodeRoutine(ROUTINE)).toStrictEqual(ROUTINE_DRAFT);
  });

  it("decodes a Draft back to the Routine it was encoded from", () => {
    expect(decodeRoutineDraft(encodeRoutine(ROUTINE))).toStrictEqual(ROUTINE);
  });

  it("normalizes a Tempo with a lowercase x", () => {
    expect(
      decodeRoutineDraft(withSetDraft({ tempo: "3-0-x-2" })),
    ).toMatchObject({
      sections: {
        main: [{ exercises: [{ sets: [{ tempo: "3-0-X-2" }] }] }],
      },
    });
  });

  it("rejects a name made only of spaces with the empty name message", () => {
    expect(() => decodeRoutineDraft({ ...ROUTINE_DRAFT, name: "  " })).toThrow(
      "This routine has no name: enter a name.",
    );
  });

  it("rejects an Amount of 0 with the Amount's minimum", () => {
    expect(() => decodeRoutineDraft(withSetDraft({ amount: "0" }))).toThrow(
      "This number isn't valid: enter a whole number of at least 1.",
    );
  });

  it("rejects a Rest of 0 seconds with the Rest's minimum", () => {
    expect(() =>
      decodeRoutineDraft(withSetDraft({ restSeconds: "0" })),
    ).toThrow("This number isn't valid: enter a whole number of at least 1.");
  });

  it("rejects a Tempo of three numbers with the Tempo message", () => {
    expect(() => decodeRoutineDraft(withSetDraft({ tempo: "3-0-1" }))).toThrow(
      "This tempo isn't valid: enter four numbers separated by hyphens, like 3-0-1-2, with X allowed only as the third.",
    );
  });

  it("rejects a Drop set with no Segment count with the Segment count's minimum", () => {
    expect(() =>
      decodeRoutineDraft(
        withSetDraft({
          intensityTechnique: {
            _tag: "DropSet",
            segmentCount: "",
            weightPercentage: "",
          },
        }),
      ),
    ).toThrow("This number isn't valid: enter a whole number of at least 2.");
  });

  it("rejects a Drop set with a weight percentage of 100 with its range", () => {
    expect(() =>
      decodeRoutineDraft(
        withSetDraft({
          intensityTechnique: {
            _tag: "DropSet",
            segmentCount: "3",
            weightPercentage: "100",
          },
        }),
      ),
    ).toThrow("This number isn't valid: enter a whole number from 1 to 99.");
  });

  it("rejects a Rest-pause set with 1 Segment with the Segment count's minimum", () => {
    expect(() =>
      decodeRoutineDraft(
        withSetDraft({
          intensityTechnique: {
            _tag: "RestPauseSet",
            pauseSeconds: "15",
            segmentCount: "1",
          },
        }),
      ),
    ).toThrow("This number isn't valid: enter a whole number of at least 2.");
  });

  it("rejects a Rest-pause set with a Pause of 0 seconds with the Pause's minimum", () => {
    expect(() =>
      decodeRoutineDraft(
        withSetDraft({
          intensityTechnique: {
            _tag: "RestPauseSet",
            pauseSeconds: "0",
            segmentCount: "3",
          },
        }),
      ),
    ).toThrow("This number isn't valid: enter a whole number of at least 1.");
  });

  it("rejects a Routine with no Routine exercise in the main Section with its message", () => {
    expect(() =>
      decodeRoutineDraft({
        ...ROUTINE_DRAFT,
        sections: { ...ROUTINE_DRAFT.sections, main: [] },
      }),
    ).toThrow(
      "This routine has no exercise in the main section: add an exercise to the main section.",
    );
  });

  it("rejects two nodes of the tree with the same id", () => {
    expect(() =>
      decodeRoutineDraft(
        withSetDraft({ id: "01900000-0000-7000-8000-000000000301" }),
      ),
    ).toThrow("Something went wrong: try again.");
  });
});
