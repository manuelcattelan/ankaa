import { recordedSetDraftsReducer } from "#/features/workout/core/recorded-set-drafts-reducer.ts";

const FIRST_SET_DRAFT_ENTRY = {
  draft: { id: "set-1", segments: [{ amount: "9", weight: "60" }] },
  exerciseId: "bench-press",
  position: 0,
  workoutExerciseId: "bench-press-workout-exercise",
};

const SECOND_SET_DRAFT_ENTRY = {
  draft: { id: "", segments: [{ amount: "7", weight: "60" }] },
  exerciseId: "bench-press",
  position: 1,
  workoutExerciseId: "bench-press-workout-exercise",
};

const PUSH_UP_SET_DRAFT_ENTRY = {
  draft: { id: "", segments: [{ amount: "12", weight: "" }] },
  exerciseId: "push-up",
  position: 0,
  workoutExerciseId: "push-up-workout-exercise",
};

describe("recordedSetDraftsReducer", () => {
  it("adds the Draft of a Set the User starts editing", () => {
    expect(
      recordedSetDraftsReducer([FIRST_SET_DRAFT_ENTRY], {
        entry: SECOND_SET_DRAFT_ENTRY,
        type: "changedRecordedSetDraft",
      }),
    ).toStrictEqual([FIRST_SET_DRAFT_ENTRY, SECOND_SET_DRAFT_ENTRY]);
  });

  it("replaces the Draft of a Set the User keeps editing", () => {
    expect(
      recordedSetDraftsReducer([FIRST_SET_DRAFT_ENTRY], {
        entry: {
          ...FIRST_SET_DRAFT_ENTRY,
          draft: { id: "set-1", segments: [{ amount: "10", weight: "60" }] },
        },
        type: "changedRecordedSetDraft",
      }),
    ).toStrictEqual([
      {
        ...FIRST_SET_DRAFT_ENTRY,
        draft: { id: "set-1", segments: [{ amount: "10", weight: "60" }] },
      },
    ]);
  });

  it("clears the Draft of a Set that has nothing left to Save", () => {
    expect(
      recordedSetDraftsReducer(
        [FIRST_SET_DRAFT_ENTRY, SECOND_SET_DRAFT_ENTRY],
        {
          position: 0,
          type: "clearedRecordedSetDraft",
          workoutExerciseId: "bench-press-workout-exercise",
        },
      ),
    ).toStrictEqual([SECOND_SET_DRAFT_ENTRY]);
  });

  it("clears the Draft of a removed Set and moves the Drafts of the Sets after it up one position, keeping the Drafts of other Workout exercises", () => {
    expect(
      recordedSetDraftsReducer(
        [
          FIRST_SET_DRAFT_ENTRY,
          SECOND_SET_DRAFT_ENTRY,
          PUSH_UP_SET_DRAFT_ENTRY,
        ],
        {
          position: 0,
          type: "removedRecordedSet",
          workoutExerciseId: "bench-press-workout-exercise",
        },
      ),
    ).toStrictEqual([
      { ...SECOND_SET_DRAFT_ENTRY, position: 0 },
      PUSH_UP_SET_DRAFT_ENTRY,
    ]);
  });
});
