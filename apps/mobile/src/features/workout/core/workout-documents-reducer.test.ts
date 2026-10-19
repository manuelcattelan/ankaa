import type {
  WorkoutDocument,
  WorkoutDocumentExercise,
  WorkoutDocumentExerciseSet,
} from "@/features/workout/core/workout-document-schema";

import { workoutDocumentsReducer } from "@/features/workout/core/workout-documents-reducer";

const WARM_UP_SET: WorkoutDocumentExerciseSet = {
  id: "019a0000-0000-7000-8000-000000000601",
  isToFailure: false,
  segments: [
    {
      amount: "12",
      id: "019a0000-0000-7000-8000-000000000701",
      weightUnit: "pound",
      weightValue: "95",
    },
  ],
  setType: "warm_up",
};

const WORKING_SET: WorkoutDocumentExerciseSet = {
  id: "019a0000-0000-7000-8000-000000000602",
  isToFailure: true,
  segments: [
    {
      amount: "8",
      id: "019a0000-0000-7000-8000-000000000702",
      weightUnit: "kilogram",
      weightValue: "85",
    },
  ],
  setType: "working",
  tempo: "3-1-X-0",
  variation: "drop_set",
};

const WORKOUT_DOCUMENT_EXERCISE: WorkoutDocumentExercise = {
  amountUnit: "repetition",
  exerciseId: "019a0000-0000-7000-8000-000000000001",
  id: "019a0000-0000-7000-8000-000000000501",
  note: "",
  routineExerciseSets: [
    { amount: 12, isToFailure: false, restSeconds: 60, setType: "warm_up" },
    {
      amount: 8,
      dropSetSegmentCount: 3,
      isToFailure: true,
      restSeconds: 120,
      setType: "working",
      tempo: "3-1-X-0",
      variation: "drop_set",
    },
  ],
  section: "main",
  sets: [WARM_UP_SET],
  skipReasonNote: "",
  weightType: "total",
};

const WORKOUT_DOCUMENT: WorkoutDocument = {
  exercises: [WORKOUT_DOCUMENT_EXERCISE],
  id: "019a0000-0000-7000-8000-000000000301",
  routineId: "019a0000-0000-7000-8000-000000000201",
  startedAt: "2026-10-19T08:00:00.000Z",
  syncedVersion: 2,
  userId: "019a0000-0000-7000-8000-000000000401",
  version: 3,
};

const STOPPED_WORKOUT_DOCUMENT: WorkoutDocument = {
  endedAt: "2026-10-18T09:00:00.000Z",
  exercises: [],
  id: "019a0000-0000-7000-8000-000000000302",
  routineId: "019a0000-0000-7000-8000-000000000201",
  startedAt: "2026-10-18T08:00:00.000Z",
  syncedVersion: 4,
  userId: "019a0000-0000-7000-8000-000000000401",
  version: 5,
};

describe("workoutDocumentsReducer", () => {
  it("adds the Workout document of a started Workout", () => {
    expect(
      workoutDocumentsReducer([STOPPED_WORKOUT_DOCUMENT], {
        type: "startedWorkout",
        workoutDocument: WORKOUT_DOCUMENT,
      }),
    ).toEqual([STOPPED_WORKOUT_DOCUMENT, WORKOUT_DOCUMENT]);
  });

  it("ends a stopped Workout, stops its rest timer and increases its version", () => {
    expect(
      workoutDocumentsReducer(
        [
          {
            ...WORKOUT_DOCUMENT,
            restTimer: {
              restSeconds: 120,
              startedAt: "2026-10-19T08:58:00.000Z",
            },
          },
        ],
        {
          endedAt: "2026-10-19T09:00:00.000Z",
          type: "stoppedWorkout",
          workoutId: "019a0000-0000-7000-8000-000000000301",
        },
      ),
    ).toEqual([
      {
        ...WORKOUT_DOCUMENT,
        endedAt: "2026-10-19T09:00:00.000Z",
        restTimer: undefined,
        version: 4,
      },
    ]);
  });

  it("changes only the Workout document that the action names", () => {
    expect(
      workoutDocumentsReducer([WORKOUT_DOCUMENT, STOPPED_WORKOUT_DOCUMENT], {
        endedAt: "2026-10-19T09:00:00.000Z",
        type: "stoppedWorkout",
        workoutId: "019a0000-0000-7000-8000-000000000301",
      }),
    ).toEqual([
      {
        ...WORKOUT_DOCUMENT,
        endedAt: "2026-10-19T09:00:00.000Z",
        restTimer: undefined,
        version: 4,
      },
      STOPPED_WORKOUT_DOCUMENT,
    ]);
  });

  it("starts a rest timer and increases the version", () => {
    expect(
      workoutDocumentsReducer([WORKOUT_DOCUMENT], {
        restTimer: {
          restNotificationId: "rest-notification-1",
          restSeconds: 120,
          startedAt: "2026-10-19T08:10:00.000Z",
        },
        type: "startedRestTimer",
        workoutId: "019a0000-0000-7000-8000-000000000301",
      }),
    ).toEqual([
      {
        ...WORKOUT_DOCUMENT,
        restTimer: {
          restNotificationId: "rest-notification-1",
          restSeconds: 120,
          startedAt: "2026-10-19T08:10:00.000Z",
        },
        version: 4,
      },
    ]);
  });

  it("stops the rest timer when the Rest is skipped and increases the version", () => {
    expect(
      workoutDocumentsReducer(
        [
          {
            ...WORKOUT_DOCUMENT,
            restTimer: {
              restSeconds: 120,
              startedAt: "2026-10-19T08:10:00.000Z",
            },
          },
        ],
        {
          type: "skippedRest",
          workoutId: "019a0000-0000-7000-8000-000000000301",
        },
      ),
    ).toEqual([{ ...WORKOUT_DOCUMENT, restTimer: undefined, version: 4 }]);
  });

  it("changes the note of a Workout exercise and increases the version", () => {
    expect(
      workoutDocumentsReducer([WORKOUT_DOCUMENT], {
        note: "Felt strong",
        type: "changedExerciseNote",
        workoutExerciseId: "019a0000-0000-7000-8000-000000000501",
        workoutId: "019a0000-0000-7000-8000-000000000301",
      }),
    ).toEqual([
      {
        ...WORKOUT_DOCUMENT,
        exercises: [{ ...WORKOUT_DOCUMENT_EXERCISE, note: "Felt strong" }],
        version: 4,
      },
    ]);
  });

  it("changes the skip reason of a Workout exercise and increases the version", () => {
    expect(
      workoutDocumentsReducer([WORKOUT_DOCUMENT], {
        skipReason: "pain",
        type: "changedSkipReason",
        workoutExerciseId: "019a0000-0000-7000-8000-000000000501",
        workoutId: "019a0000-0000-7000-8000-000000000301",
      }),
    ).toEqual([
      {
        ...WORKOUT_DOCUMENT,
        exercises: [{ ...WORKOUT_DOCUMENT_EXERCISE, skipReason: "pain" }],
        version: 4,
      },
    ]);
  });

  it("changes the skip reason note of a Workout exercise and increases the version", () => {
    expect(
      workoutDocumentsReducer([WORKOUT_DOCUMENT], {
        skipReasonNote: "Sore shoulder",
        type: "changedSkipReasonNote",
        workoutExerciseId: "019a0000-0000-7000-8000-000000000501",
        workoutId: "019a0000-0000-7000-8000-000000000301",
      }),
    ).toEqual([
      {
        ...WORKOUT_DOCUMENT,
        exercises: [
          { ...WORKOUT_DOCUMENT_EXERCISE, skipReasonNote: "Sore shoulder" },
        ],
        version: 4,
      },
    ]);
  });

  it("adds the Set that the Routine plans next, with one empty Segment in the weight unit used last", () => {
    expect(
      workoutDocumentsReducer([WORKOUT_DOCUMENT], {
        type: "addedSet",
        workoutExerciseId: "019a0000-0000-7000-8000-000000000501",
        workoutExerciseSetId: "019a0000-0000-7000-8000-000000000602",
        workoutExerciseSetSegmentId: "019a0000-0000-7000-8000-000000000702",
        workoutId: "019a0000-0000-7000-8000-000000000301",
      }),
    ).toEqual([
      {
        ...WORKOUT_DOCUMENT,
        exercises: [
          {
            ...WORKOUT_DOCUMENT_EXERCISE,
            sets: [
              WARM_UP_SET,
              {
                id: "019a0000-0000-7000-8000-000000000602",
                isToFailure: true,
                segments: [
                  {
                    amount: "",
                    id: "019a0000-0000-7000-8000-000000000702",
                    weightUnit: "pound",
                    weightValue: "",
                  },
                ],
                setType: "working",
                tempo: "3-1-X-0",
                variation: "drop_set",
              },
            ],
          },
        ],
        version: 4,
      },
    ]);
  });

  it("adds a Working set in kilograms, not to failure, when the Routine plans no Set and no weight was entered yet", () => {
    expect(
      workoutDocumentsReducer(
        [
          {
            ...WORKOUT_DOCUMENT,
            exercises: [
              {
                ...WORKOUT_DOCUMENT_EXERCISE,
                routineExerciseSets: [],
                sets: [],
              },
            ],
          },
        ],
        {
          type: "addedSet",
          workoutExerciseId: "019a0000-0000-7000-8000-000000000501",
          workoutExerciseSetId: "019a0000-0000-7000-8000-000000000601",
          workoutExerciseSetSegmentId: "019a0000-0000-7000-8000-000000000701",
          workoutId: "019a0000-0000-7000-8000-000000000301",
        },
      ),
    ).toEqual([
      {
        ...WORKOUT_DOCUMENT,
        exercises: [
          {
            ...WORKOUT_DOCUMENT_EXERCISE,
            routineExerciseSets: [],
            sets: [
              {
                id: "019a0000-0000-7000-8000-000000000601",
                isToFailure: false,
                segments: [
                  {
                    amount: "",
                    id: "019a0000-0000-7000-8000-000000000701",
                    weightUnit: "kilogram",
                    weightValue: "",
                  },
                ],
                setType: "working",
                tempo: undefined,
                variation: undefined,
              },
            ],
          },
        ],
        version: 4,
      },
    ]);
  });

  it("adds a Segment without a weight unit for an Exercise whose Weight type has no weight", () => {
    expect(
      workoutDocumentsReducer(
        [
          {
            ...WORKOUT_DOCUMENT,
            exercises: [
              { ...WORKOUT_DOCUMENT_EXERCISE, sets: [], weightType: "none" },
            ],
          },
        ],
        {
          type: "addedSet",
          workoutExerciseId: "019a0000-0000-7000-8000-000000000501",
          workoutExerciseSetId: "019a0000-0000-7000-8000-000000000601",
          workoutExerciseSetSegmentId: "019a0000-0000-7000-8000-000000000701",
          workoutId: "019a0000-0000-7000-8000-000000000301",
        },
      )[0].exercises[0].sets[0].segments,
    ).toEqual([
      {
        amount: "",
        id: "019a0000-0000-7000-8000-000000000701",
        weightUnit: undefined,
        weightValue: "",
      },
    ]);
  });

  it("adds an empty Segment to a Set, in the weight unit entered last for the Workout exercise, and increases the version", () => {
    expect(
      workoutDocumentsReducer(
        [
          {
            ...WORKOUT_DOCUMENT,
            exercises: [
              {
                ...WORKOUT_DOCUMENT_EXERCISE,
                sets: [WARM_UP_SET, WORKING_SET],
              },
            ],
          },
        ],
        {
          type: "addedSegment",
          workoutExerciseId: "019a0000-0000-7000-8000-000000000501",
          workoutExerciseSetId: "019a0000-0000-7000-8000-000000000601",
          workoutExerciseSetSegmentId: "019a0000-0000-7000-8000-000000000703",
          workoutId: "019a0000-0000-7000-8000-000000000301",
        },
      ),
    ).toEqual([
      {
        ...WORKOUT_DOCUMENT,
        exercises: [
          {
            ...WORKOUT_DOCUMENT_EXERCISE,
            sets: [
              {
                ...WARM_UP_SET,
                segments: [
                  {
                    amount: "12",
                    id: "019a0000-0000-7000-8000-000000000701",
                    weightUnit: "pound",
                    weightValue: "95",
                  },
                  {
                    amount: "",
                    id: "019a0000-0000-7000-8000-000000000703",
                    weightUnit: "kilogram",
                    weightValue: "",
                  },
                ],
              },
              WORKING_SET,
            ],
          },
        ],
        version: 4,
      },
    ]);
  });

  it("replaces a changed Segment and increases the version", () => {
    expect(
      workoutDocumentsReducer([WORKOUT_DOCUMENT], {
        type: "changedSegment",
        workoutExerciseId: "019a0000-0000-7000-8000-000000000501",
        workoutExerciseSetId: "019a0000-0000-7000-8000-000000000601",
        workoutExerciseSetSegment: {
          amount: "10",
          id: "019a0000-0000-7000-8000-000000000701",
          weightUnit: "kilogram",
          weightValue: "45",
        },
        workoutId: "019a0000-0000-7000-8000-000000000301",
      }),
    ).toEqual([
      {
        ...WORKOUT_DOCUMENT,
        exercises: [
          {
            ...WORKOUT_DOCUMENT_EXERCISE,
            sets: [
              {
                ...WARM_UP_SET,
                segments: [
                  {
                    amount: "10",
                    id: "019a0000-0000-7000-8000-000000000701",
                    weightUnit: "kilogram",
                    weightValue: "45",
                  },
                ],
              },
            ],
          },
        ],
        version: 4,
      },
    ]);
  });

  it("removes the last Set of a Workout exercise and increases the version", () => {
    expect(
      workoutDocumentsReducer(
        [
          {
            ...WORKOUT_DOCUMENT,
            exercises: [
              {
                ...WORKOUT_DOCUMENT_EXERCISE,
                sets: [WARM_UP_SET, WORKING_SET],
              },
            ],
          },
        ],
        {
          type: "removedSet",
          workoutExerciseId: "019a0000-0000-7000-8000-000000000501",
          workoutId: "019a0000-0000-7000-8000-000000000301",
        },
      ),
    ).toEqual([
      {
        ...WORKOUT_DOCUMENT,
        exercises: [{ ...WORKOUT_DOCUMENT_EXERCISE, sets: [WARM_UP_SET] }],
        version: 4,
      },
    ]);
  });

  it("records the Saved version as the version of the last Save, without increasing the version", () => {
    expect(
      workoutDocumentsReducer([WORKOUT_DOCUMENT], {
        type: "savedWorkout",
        version: 3,
        workoutId: "019a0000-0000-7000-8000-000000000301",
      }),
    ).toEqual([{ ...WORKOUT_DOCUMENT, syncedVersion: 3 }]);
  });

  it("keeps the version of the last Save when a Save of an older version succeeds later", () => {
    expect(
      workoutDocumentsReducer([WORKOUT_DOCUMENT], {
        type: "savedWorkout",
        version: 1,
        workoutId: "019a0000-0000-7000-8000-000000000301",
      }),
    ).toEqual([WORKOUT_DOCUMENT]);
  });

  it("removes a stopped Workout document once its last version is Saved", () => {
    expect(
      workoutDocumentsReducer([STOPPED_WORKOUT_DOCUMENT], {
        type: "savedWorkout",
        version: 5,
        workoutId: "019a0000-0000-7000-8000-000000000302",
      }),
    ).toEqual([]);
  });

  it("keeps a stopped Workout document while a later version isn't Saved", () => {
    expect(
      workoutDocumentsReducer(
        [{ ...STOPPED_WORKOUT_DOCUMENT, syncedVersion: 3 }],
        {
          type: "savedWorkout",
          version: 4,
          workoutId: "019a0000-0000-7000-8000-000000000302",
        },
      ),
    ).toEqual([STOPPED_WORKOUT_DOCUMENT]);
  });
});
