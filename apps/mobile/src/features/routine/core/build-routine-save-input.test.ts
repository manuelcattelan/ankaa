import type {
  RoutineDraft,
  RoutineDraftExercise,
  RoutineDraftExerciseSet,
} from "@/features/routine/core/routine-draft-reducer";

import { buildRoutineSaveInput } from "@/features/routine/core/build-routine-save-input";

const ROUTINE_DRAFT_EXERCISE_SET: RoutineDraftExerciseSet = {
  amount: "8",
  dropSetSegmentCount: "",
  dropSetWeightPercentage: "",
  id: "019c0000-0000-7000-8000-000000000001",
  isToFailure: false,
  restPauseRestSeconds: "",
  restPauseSegmentCount: "",
  restSeconds: "90",
  setType: "working",
  tempo: "3-0-1-2",
  variation: undefined,
};

const JUMPING_JACK_ROUTINE_DRAFT_EXERCISE: RoutineDraftExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000001",
  id: "019b0000-0000-7000-8000-000000000001",
  note: "",
  sets: [],
};

const BENCH_PRESS_ROUTINE_DRAFT_EXERCISE: RoutineDraftExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000002",
  id: "019b0000-0000-7000-8000-000000000002",
  note: "",
  sets: [],
};

const PUSH_UP_ROUTINE_DRAFT_EXERCISE: RoutineDraftExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000003",
  id: "019b0000-0000-7000-8000-000000000003",
  note: "",
  sets: [],
};

const PULL_UP_ROUTINE_DRAFT_EXERCISE: RoutineDraftExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000004",
  id: "019b0000-0000-7000-8000-000000000004",
  note: "",
  sets: [],
};

const PLANK_ROUTINE_DRAFT_EXERCISE: RoutineDraftExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000005",
  id: "019b0000-0000-7000-8000-000000000005",
  note: "",
  sets: [],
};

const ROUTINE_DRAFT: RoutineDraft = {
  days: [],
  id: undefined,
  name: "Push Day",
  sections: { cool_down: [], main: [], warm_up: [] },
};

const ROUTINE_ID = "019d0000-0000-7000-8000-000000000001";

describe("buildRoutineSaveInput", () => {
  it("builds the Save of a Routine draft without exercises with the given Routine identifier", () => {
    expect(
      buildRoutineSaveInput({
        routineDraft: ROUTINE_DRAFT,
        routineId: ROUTINE_ID,
      }),
    ).toEqual({
      days: [],
      exercises: [],
      id: "019d0000-0000-7000-8000-000000000001",
      name: "Push Day",
    });
  });

  it("sorts the days in the order of the week", () => {
    expect(
      buildRoutineSaveInput({
        routineDraft: {
          ...ROUTINE_DRAFT,
          days: ["sunday", "friday", "monday"],
        },
        routineId: ROUTINE_ID,
      }).days,
    ).toEqual(["monday", "friday", "sunday"]);
  });

  it("removes the spaces around the name", () => {
    expect(
      buildRoutineSaveInput({
        routineDraft: { ...ROUTINE_DRAFT, name: " Push Day " },
        routineId: ROUTINE_ID,
      }).name,
    ).toBe("Push Day");
  });

  it("numbers the exercises of every Section in order, each with its Section, its Superset and the exercise its Warm-up exercise prepares for", () => {
    expect(
      buildRoutineSaveInput({
        routineDraft: {
          ...ROUTINE_DRAFT,
          sections: {
            cool_down: [
              {
                exercises: [PLANK_ROUTINE_DRAFT_EXERCISE],
                id: "019b0000-0000-7000-8000-000000000005",
                warmUpExercises: [],
              },
            ],
            main: [
              {
                exercises: [
                  BENCH_PRESS_ROUTINE_DRAFT_EXERCISE,
                  PULL_UP_ROUTINE_DRAFT_EXERCISE,
                ],
                id: "019b0000-0000-7000-8000-000000000002",
                warmUpExercises: [
                  {
                    ...PUSH_UP_ROUTINE_DRAFT_EXERCISE,
                    warmUpForRoutineExerciseId:
                      "019b0000-0000-7000-8000-000000000002",
                  },
                ],
              },
            ],
            warm_up: [
              {
                exercises: [JUMPING_JACK_ROUTINE_DRAFT_EXERCISE],
                id: "019b0000-0000-7000-8000-000000000001",
                warmUpExercises: [],
              },
            ],
          },
        },
        routineId: ROUTINE_ID,
      }).exercises,
    ).toEqual([
      {
        exerciseId: "019a0000-0000-7000-8000-000000000001",
        id: "019b0000-0000-7000-8000-000000000001",
        note: null,
        position: 0,
        section: "warm_up",
        sets: [],
        superset: null,
        warmUpForRoutineExerciseId: null,
      },
      {
        exerciseId: "019a0000-0000-7000-8000-000000000003",
        id: "019b0000-0000-7000-8000-000000000003",
        note: null,
        position: 1,
        section: "warm_up",
        sets: [],
        superset: null,
        warmUpForRoutineExerciseId: "019b0000-0000-7000-8000-000000000002",
      },
      {
        exerciseId: "019a0000-0000-7000-8000-000000000002",
        id: "019b0000-0000-7000-8000-000000000002",
        note: null,
        position: 2,
        section: "main",
        sets: [],
        superset: 1,
        warmUpForRoutineExerciseId: null,
      },
      {
        exerciseId: "019a0000-0000-7000-8000-000000000004",
        id: "019b0000-0000-7000-8000-000000000004",
        note: null,
        position: 3,
        section: "main",
        sets: [],
        superset: 1,
        warmUpForRoutineExerciseId: null,
      },
      {
        exerciseId: "019a0000-0000-7000-8000-000000000005",
        id: "019b0000-0000-7000-8000-000000000005",
        note: null,
        position: 4,
        section: "cool_down",
        sets: [],
        superset: null,
        warmUpForRoutineExerciseId: null,
      },
    ]);
  });

  it("removes the spaces around the note of an exercise", () => {
    expect(
      buildRoutineSaveInput({
        routineDraft: {
          ...ROUTINE_DRAFT,
          sections: {
            cool_down: [],
            main: [
              {
                exercises: [
                  {
                    ...BENCH_PRESS_ROUTINE_DRAFT_EXERCISE,
                    note: " Pause at the bottom ",
                  },
                ],
                id: "019b0000-0000-7000-8000-000000000002",
                warmUpExercises: [],
              },
            ],
            warm_up: [],
          },
        },
        routineId: ROUTINE_ID,
      }).exercises[0]?.note,
    ).toBe("Pause at the bottom");
  });

  it("sends a note of only spaces as null", () => {
    expect(
      buildRoutineSaveInput({
        routineDraft: {
          ...ROUTINE_DRAFT,
          sections: {
            cool_down: [],
            main: [
              {
                exercises: [
                  { ...BENCH_PRESS_ROUTINE_DRAFT_EXERCISE, note: "  " },
                ],
                id: "019b0000-0000-7000-8000-000000000002",
                warmUpExercises: [],
              },
            ],
            warm_up: [],
          },
        },
        routineId: ROUTINE_ID,
      }).exercises[0]?.note,
    ).toBe(null);
  });

  it("numbers the Sets of an exercise in order, with their text as numbers and their Tempo formatted", () => {
    expect(
      buildRoutineSaveInput({
        routineDraft: {
          ...ROUTINE_DRAFT,
          sections: {
            cool_down: [],
            main: [
              {
                exercises: [
                  {
                    ...BENCH_PRESS_ROUTINE_DRAFT_EXERCISE,
                    sets: [
                      {
                        ...ROUTINE_DRAFT_EXERCISE_SET,
                        setType: "warm_up",
                      },
                      {
                        ...ROUTINE_DRAFT_EXERCISE_SET,
                        amount: " 6 ",
                        id: "019c0000-0000-7000-8000-000000000002",
                        isToFailure: true,
                        restSeconds: "120",
                        tempo: " 3-0-x-2 ",
                      },
                    ],
                  },
                ],
                id: "019b0000-0000-7000-8000-000000000002",
                warmUpExercises: [],
              },
            ],
            warm_up: [],
          },
        },
        routineId: ROUTINE_ID,
      }).exercises[0]?.sets,
    ).toEqual([
      {
        amount: 8,
        dropSetSegmentCount: null,
        dropSetWeightPercentage: null,
        id: "019c0000-0000-7000-8000-000000000001",
        isToFailure: false,
        position: 0,
        restPauseRestSeconds: null,
        restPauseSegmentCount: null,
        restSeconds: 90,
        setType: "warm_up",
        tempo: "3-0-1-2",
        variation: null,
      },
      {
        amount: 6,
        dropSetSegmentCount: null,
        dropSetWeightPercentage: null,
        id: "019c0000-0000-7000-8000-000000000002",
        isToFailure: true,
        position: 1,
        restPauseRestSeconds: null,
        restPauseSegmentCount: null,
        restSeconds: 120,
        setType: "working",
        tempo: "3-0-X-2",
        variation: null,
      },
    ]);
  });

  it("sends the empty Amount, Rest and Tempo of a Set as null", () => {
    expect(
      buildRoutineSaveInput({
        routineDraft: {
          ...ROUTINE_DRAFT,
          sections: {
            cool_down: [],
            main: [
              {
                exercises: [
                  {
                    ...BENCH_PRESS_ROUTINE_DRAFT_EXERCISE,
                    sets: [
                      {
                        ...ROUTINE_DRAFT_EXERCISE_SET,
                        amount: "",
                        restSeconds: " ",
                        tempo: " ",
                      },
                    ],
                  },
                ],
                id: "019b0000-0000-7000-8000-000000000002",
                warmUpExercises: [],
              },
            ],
            warm_up: [],
          },
        },
        routineId: ROUTINE_ID,
      }).exercises[0]?.sets,
    ).toEqual([
      {
        amount: null,
        dropSetSegmentCount: null,
        dropSetWeightPercentage: null,
        id: "019c0000-0000-7000-8000-000000000001",
        isToFailure: false,
        position: 0,
        restPauseRestSeconds: null,
        restPauseSegmentCount: null,
        restSeconds: null,
        setType: "working",
        tempo: null,
        variation: null,
      },
    ]);
  });

  it("sends the Drop set fields of a Drop set, and no Rest-pause set field", () => {
    expect(
      buildRoutineSaveInput({
        routineDraft: {
          ...ROUTINE_DRAFT,
          sections: {
            cool_down: [],
            main: [
              {
                exercises: [
                  {
                    ...BENCH_PRESS_ROUTINE_DRAFT_EXERCISE,
                    sets: [
                      {
                        ...ROUTINE_DRAFT_EXERCISE_SET,
                        dropSetSegmentCount: "3",
                        dropSetWeightPercentage: "20",
                        restPauseRestSeconds: "15",
                        restPauseSegmentCount: "4",
                        variation: "drop_set",
                      },
                    ],
                  },
                ],
                id: "019b0000-0000-7000-8000-000000000002",
                warmUpExercises: [],
              },
            ],
            warm_up: [],
          },
        },
        routineId: ROUTINE_ID,
      }).exercises[0]?.sets,
    ).toEqual([
      {
        amount: 8,
        dropSetSegmentCount: 3,
        dropSetWeightPercentage: 20,
        id: "019c0000-0000-7000-8000-000000000001",
        isToFailure: false,
        position: 0,
        restPauseRestSeconds: null,
        restPauseSegmentCount: null,
        restSeconds: 90,
        setType: "working",
        tempo: "3-0-1-2",
        variation: "drop_set",
      },
    ]);
  });

  it("sends the Rest-pause set fields of a Rest-pause set, and no Drop set field", () => {
    expect(
      buildRoutineSaveInput({
        routineDraft: {
          ...ROUTINE_DRAFT,
          sections: {
            cool_down: [],
            main: [
              {
                exercises: [
                  {
                    ...BENCH_PRESS_ROUTINE_DRAFT_EXERCISE,
                    sets: [
                      {
                        ...ROUTINE_DRAFT_EXERCISE_SET,
                        dropSetSegmentCount: "3",
                        dropSetWeightPercentage: "20",
                        restPauseRestSeconds: "15",
                        restPauseSegmentCount: "4",
                        variation: "rest_pause",
                      },
                    ],
                  },
                ],
                id: "019b0000-0000-7000-8000-000000000002",
                warmUpExercises: [],
              },
            ],
            warm_up: [],
          },
        },
        routineId: ROUTINE_ID,
      }).exercises[0]?.sets,
    ).toEqual([
      {
        amount: 8,
        dropSetSegmentCount: null,
        dropSetWeightPercentage: null,
        id: "019c0000-0000-7000-8000-000000000001",
        isToFailure: false,
        position: 0,
        restPauseRestSeconds: 15,
        restPauseSegmentCount: 4,
        restSeconds: 90,
        setType: "working",
        tempo: "3-0-1-2",
        variation: "rest_pause",
      },
    ]);
  });

  it("sends no Drop set or Rest-pause set field for a Set without an Intensity technique", () => {
    expect(
      buildRoutineSaveInput({
        routineDraft: {
          ...ROUTINE_DRAFT,
          sections: {
            cool_down: [],
            main: [
              {
                exercises: [
                  {
                    ...BENCH_PRESS_ROUTINE_DRAFT_EXERCISE,
                    sets: [
                      {
                        ...ROUTINE_DRAFT_EXERCISE_SET,
                        dropSetSegmentCount: "3",
                        dropSetWeightPercentage: "20",
                        restPauseRestSeconds: "15",
                        restPauseSegmentCount: "4",
                      },
                    ],
                  },
                ],
                id: "019b0000-0000-7000-8000-000000000002",
                warmUpExercises: [],
              },
            ],
            warm_up: [],
          },
        },
        routineId: ROUTINE_ID,
      }).exercises[0]?.sets,
    ).toEqual([
      {
        amount: 8,
        dropSetSegmentCount: null,
        dropSetWeightPercentage: null,
        id: "019c0000-0000-7000-8000-000000000001",
        isToFailure: false,
        position: 0,
        restPauseRestSeconds: null,
        restPauseSegmentCount: null,
        restSeconds: 90,
        setType: "working",
        tempo: "3-0-1-2",
        variation: null,
      },
    ]);
  });
});
