import { routineDraftReducer } from "#/features/routine/core/routine-draft-reducer.ts";

const SET_DRAFT = {
  amount: "8",
  id: "set-1",
  intensityTechnique: null,
  isToFailure: false,
  restSeconds: "",
  tempo: "",
  type: "working" as const,
};

const BENCH_PRESS_ROUTINE_EXERCISE_DRAFT = {
  exerciseId: "bench-press",
  id: "bench-press-routine-exercise",
  note: "",
  sets: [SET_DRAFT],
  warmUpExercises: [
    {
      exerciseId: "band-pull-apart",
      id: "band-pull-apart-routine-exercise",
      note: "",
      sets: [],
    },
  ],
};

const PUSH_UP_ROUTINE_EXERCISE_DRAFT = {
  exerciseId: "push-up",
  id: "push-up-routine-exercise",
  note: "",
  sets: [],
  warmUpExercises: [],
};

const DIP_ROUTINE_EXERCISE_DRAFT = {
  exerciseId: "dip",
  id: "dip-routine-exercise",
  note: "",
  sets: [],
  warmUpExercises: [],
};

const ROUTINE_DRAFT = {
  days: [],
  id: "",
  name: "",
  sections: {
    coolDown: [],
    main: [
      {
        exercises: [BENCH_PRESS_ROUTINE_EXERCISE_DRAFT],
        id: "bench-press-exercise-group",
      },
      {
        exercises: [PUSH_UP_ROUTINE_EXERCISE_DRAFT],
        id: "push-up-exercise-group",
      },
      { exercises: [DIP_ROUTINE_EXERCISE_DRAFT], id: "dip-exercise-group" },
    ],
    warmUp: [],
  },
};

describe("routineDraftReducer", () => {
  it("changes the name", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        name: "Push day",
        type: "changedName",
      }),
    ).toStrictEqual({ ...ROUTINE_DRAFT, name: "Push day" });
  });

  it("changes the days", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        days: ["monday", "friday"],
        type: "changedDays",
      }),
    ).toStrictEqual({ ...ROUTINE_DRAFT, days: ["monday", "friday"] });
  });

  it("assigns the id", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        id: "push-day",
        type: "assignedId",
      }),
    ).toStrictEqual({ ...ROUTINE_DRAFT, id: "push-day" });
  });

  it("adds an exercise in a new Exercise group at the end of the main Section, ready for Warm-up exercises", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        exerciseGroupId: "squat-exercise-group",
        exerciseId: "squat",
        routineExerciseId: "squat-routine-exercise",
        section: "main",
        type: "addedExercise",
      }).sections.main,
    ).toStrictEqual([
      ...ROUTINE_DRAFT.sections.main,
      {
        exercises: [
          {
            exerciseId: "squat",
            id: "squat-routine-exercise",
            note: "",
            sets: [],
            warmUpExercises: [],
          },
        ],
        id: "squat-exercise-group",
      },
    ]);
  });

  it("adds an exercise in a new Exercise group of the cool-down Section", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        exerciseGroupId: "stretch-exercise-group",
        exerciseId: "stretch",
        routineExerciseId: "stretch-routine-exercise",
        section: "cool_down",
        type: "addedExercise",
      }).sections,
    ).toStrictEqual({
      ...ROUTINE_DRAFT.sections,
      coolDown: [
        {
          exercises: [
            {
              exerciseId: "stretch",
              id: "stretch-routine-exercise",
              note: "",
              sets: [],
            },
          ],
          id: "stretch-exercise-group",
        },
      ],
    });
  });

  it("adds a Warm-up exercise after the other Warm-up exercises of a main Section's Routine exercise", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        exerciseId: "push-up",
        routineExerciseId: "push-up-warm-up-routine-exercise",
        type: "addedWarmUpExercise",
        warmUpForRoutineExerciseId: "bench-press-routine-exercise",
      }).sections.main[0]?.exercises[0]?.warmUpExercises,
    ).toStrictEqual([
      {
        exerciseId: "band-pull-apart",
        id: "band-pull-apart-routine-exercise",
        note: "",
        sets: [],
      },
      {
        exerciseId: "push-up",
        id: "push-up-warm-up-routine-exercise",
        note: "",
        sets: [],
      },
    ]);
  });

  it("changes the note of a Warm-up exercise", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        note: "Light band",
        routineExerciseId: "band-pull-apart-routine-exercise",
        type: "changedExerciseNote",
      }).sections.main[0]?.exercises[0]?.warmUpExercises,
    ).toStrictEqual([
      {
        exerciseId: "band-pull-apart",
        id: "band-pull-apart-routine-exercise",
        note: "Light band",
        sets: [],
      },
    ]);
  });

  it("adds an empty working Set after the other Sets of a Routine exercise", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        routineExerciseId: "bench-press-routine-exercise",
        setId: "set-2",
        type: "addedSet",
      }).sections.main[0]?.exercises[0]?.sets,
    ).toStrictEqual([
      SET_DRAFT,
      {
        amount: "",
        id: "set-2",
        intensityTechnique: null,
        isToFailure: false,
        restSeconds: "",
        tempo: "",
        type: "working",
      },
    ]);
  });

  it("changes a Set", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        routineExerciseId: "bench-press-routine-exercise",
        set: {
          ...SET_DRAFT,
          intensityTechnique: {
            _tag: "DropSet",
            segmentCount: "3",
            weightPercentage: "",
          },
        },
        type: "changedSet",
      }).sections.main[0]?.exercises[0]?.sets,
    ).toStrictEqual([
      {
        ...SET_DRAFT,
        intensityTechnique: {
          _tag: "DropSet",
          segmentCount: "3",
          weightPercentage: "",
        },
      },
    ]);
  });

  it("removes a Set", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        routineExerciseId: "bench-press-routine-exercise",
        setId: "set-1",
        type: "removedSet",
      }).sections.main[0]?.exercises[0]?.sets,
    ).toStrictEqual([]);
  });

  it("removes a Routine exercise together with its Warm-up exercises, and its Exercise group once it's empty", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        routineExerciseId: "bench-press-routine-exercise",
        type: "removedExercise",
      }).sections.main,
    ).toStrictEqual([
      {
        exercises: [PUSH_UP_ROUTINE_EXERCISE_DRAFT],
        id: "push-up-exercise-group",
      },
      { exercises: [DIP_ROUTINE_EXERCISE_DRAFT], id: "dip-exercise-group" },
    ]);
  });

  it("removes a Warm-up exercise and keeps the Routine exercise it prepares for", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        routineExerciseId: "band-pull-apart-routine-exercise",
        type: "removedExercise",
      }).sections.main[0],
    ).toStrictEqual({
      exercises: [
        { ...BENCH_PRESS_ROUTINE_EXERCISE_DRAFT, warmUpExercises: [] },
      ],
      id: "bench-press-exercise-group",
    });
  });

  it("moves an Exercise group up", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        direction: "up",
        exerciseGroupId: "push-up-exercise-group",
        section: "main",
        type: "movedExerciseGroup",
      }).sections.main.map((exerciseGroup) => exerciseGroup.id),
    ).toStrictEqual([
      "push-up-exercise-group",
      "bench-press-exercise-group",
      "dip-exercise-group",
    ]);
  });

  it("moves an Exercise group down", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        direction: "down",
        exerciseGroupId: "push-up-exercise-group",
        section: "main",
        type: "movedExerciseGroup",
      }).sections.main.map((exerciseGroup) => exerciseGroup.id),
    ).toStrictEqual([
      "bench-press-exercise-group",
      "dip-exercise-group",
      "push-up-exercise-group",
    ]);
  });

  it("leaves the first Exercise group in place when it moves up", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        direction: "up",
        exerciseGroupId: "bench-press-exercise-group",
        section: "main",
        type: "movedExerciseGroup",
      }),
    ).toStrictEqual(ROUTINE_DRAFT);
  });

  it("joins an Exercise group with the next one into a Superset", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        exerciseGroupId: "bench-press-exercise-group",
        section: "main",
        type: "joinedNextExerciseGroup",
      }).sections.main,
    ).toStrictEqual([
      {
        exercises: [
          BENCH_PRESS_ROUTINE_EXERCISE_DRAFT,
          PUSH_UP_ROUTINE_EXERCISE_DRAFT,
        ],
        id: "bench-press-exercise-group",
      },
      { exercises: [DIP_ROUTINE_EXERCISE_DRAFT], id: "dip-exercise-group" },
    ]);
  });

  it("moves a Routine exercise that leaves a Superset to a new Exercise group right after it, with its Warm-up exercises", () => {
    const supersetRoutineDraft = routineDraftReducer(ROUTINE_DRAFT, {
      exerciseGroupId: "bench-press-exercise-group",
      section: "main",
      type: "joinedNextExerciseGroup",
    });

    expect(
      routineDraftReducer(supersetRoutineDraft, {
        exerciseGroupId: "bench-press-alone-exercise-group",
        routineExerciseId: "bench-press-routine-exercise",
        section: "main",
        type: "leftSuperset",
      }).sections.main,
    ).toStrictEqual([
      {
        exercises: [PUSH_UP_ROUTINE_EXERCISE_DRAFT],
        id: "bench-press-exercise-group",
      },
      {
        exercises: [BENCH_PRESS_ROUTINE_EXERCISE_DRAFT],
        id: "bench-press-alone-exercise-group",
      },
      { exercises: [DIP_ROUTINE_EXERCISE_DRAFT], id: "dip-exercise-group" },
    ]);
  });
});
