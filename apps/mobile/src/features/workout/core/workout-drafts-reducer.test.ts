import { workoutDraftsReducer } from "#/features/workout/core/workout-drafts-reducer.ts";

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

const BENCH_PRESS_NOTE_DRAFT_ENTRY = {
  draft: { note: "Felt strong" },
  exerciseId: "bench-press",
  workoutExerciseId: "bench-press-workout-exercise",
};

const PUSH_UP_NOTE_DRAFT_ENTRY = {
  draft: { note: "Too easy" },
  exerciseId: "push-up",
  workoutExerciseId: "push-up-workout-exercise",
};

const BENCH_PRESS_SKIP_DRAFT_ENTRY = {
  draft: { note: "", reason: "pain" as const },
  exerciseId: "bench-press",
  workoutExerciseId: "bench-press-workout-exercise",
};

const NO_DRAFTS = { notes: [], recordedSets: [], skips: [] };

describe("workoutDraftsReducer", () => {
  it("adds the Draft of a Set the User starts editing", () => {
    expect(
      workoutDraftsReducer(
        { ...NO_DRAFTS, recordedSets: [FIRST_SET_DRAFT_ENTRY] },
        { entry: SECOND_SET_DRAFT_ENTRY, type: "changedRecordedSetDraft" },
      ),
    ).toStrictEqual({
      ...NO_DRAFTS,
      recordedSets: [FIRST_SET_DRAFT_ENTRY, SECOND_SET_DRAFT_ENTRY],
    });
  });

  it("replaces the Draft of a Set the User keeps editing", () => {
    expect(
      workoutDraftsReducer(
        { ...NO_DRAFTS, recordedSets: [FIRST_SET_DRAFT_ENTRY] },
        {
          entry: {
            ...FIRST_SET_DRAFT_ENTRY,
            draft: { id: "set-1", segments: [{ amount: "10", weight: "60" }] },
          },
          type: "changedRecordedSetDraft",
        },
      ),
    ).toStrictEqual({
      ...NO_DRAFTS,
      recordedSets: [
        {
          ...FIRST_SET_DRAFT_ENTRY,
          draft: { id: "set-1", segments: [{ amount: "10", weight: "60" }] },
        },
      ],
    });
  });

  it("clears the Draft of a Set that has nothing left to Save", () => {
    expect(
      workoutDraftsReducer(
        {
          ...NO_DRAFTS,
          recordedSets: [FIRST_SET_DRAFT_ENTRY, SECOND_SET_DRAFT_ENTRY],
        },
        {
          position: 0,
          type: "clearedRecordedSetDraft",
          workoutExerciseId: "bench-press-workout-exercise",
        },
      ),
    ).toStrictEqual({ ...NO_DRAFTS, recordedSets: [SECOND_SET_DRAFT_ENTRY] });
  });

  it("clears the Draft of a removed Set and moves the Drafts of the Sets after it up one position, keeping the Drafts of other Workout exercises", () => {
    expect(
      workoutDraftsReducer(
        {
          ...NO_DRAFTS,
          recordedSets: [
            FIRST_SET_DRAFT_ENTRY,
            SECOND_SET_DRAFT_ENTRY,
            PUSH_UP_SET_DRAFT_ENTRY,
          ],
        },
        {
          position: 0,
          type: "removedRecordedSet",
          workoutExerciseId: "bench-press-workout-exercise",
        },
      ),
    ).toStrictEqual({
      ...NO_DRAFTS,
      recordedSets: [
        { ...SECOND_SET_DRAFT_ENTRY, position: 0 },
        PUSH_UP_SET_DRAFT_ENTRY,
      ],
    });
  });

  it("adds the note Draft of a Workout exercise whose note the User starts editing", () => {
    expect(
      workoutDraftsReducer(
        { ...NO_DRAFTS, notes: [BENCH_PRESS_NOTE_DRAFT_ENTRY] },
        { entry: PUSH_UP_NOTE_DRAFT_ENTRY, type: "changedNoteDraft" },
      ),
    ).toStrictEqual({
      ...NO_DRAFTS,
      notes: [BENCH_PRESS_NOTE_DRAFT_ENTRY, PUSH_UP_NOTE_DRAFT_ENTRY],
    });
  });

  it("replaces the note Draft of a Workout exercise whose note the User keeps editing", () => {
    expect(
      workoutDraftsReducer(
        { ...NO_DRAFTS, notes: [BENCH_PRESS_NOTE_DRAFT_ENTRY] },
        {
          entry: {
            ...BENCH_PRESS_NOTE_DRAFT_ENTRY,
            draft: { note: "Felt very strong" },
          },
          type: "changedNoteDraft",
        },
      ),
    ).toStrictEqual({
      ...NO_DRAFTS,
      notes: [
        {
          ...BENCH_PRESS_NOTE_DRAFT_ENTRY,
          draft: { note: "Felt very strong" },
        },
      ],
    });
  });

  it("clears the note Draft of a Workout exercise whose note has nothing left to Save, keeping its skip Draft", () => {
    expect(
      workoutDraftsReducer(
        {
          ...NO_DRAFTS,
          notes: [BENCH_PRESS_NOTE_DRAFT_ENTRY, PUSH_UP_NOTE_DRAFT_ENTRY],
          skips: [BENCH_PRESS_SKIP_DRAFT_ENTRY],
        },
        {
          type: "clearedNoteDraft",
          workoutExerciseId: "bench-press-workout-exercise",
        },
      ),
    ).toStrictEqual({
      ...NO_DRAFTS,
      notes: [PUSH_UP_NOTE_DRAFT_ENTRY],
      skips: [BENCH_PRESS_SKIP_DRAFT_ENTRY],
    });
  });

  it("adds the skip Draft of a Workout exercise whose skip the User starts editing", () => {
    expect(
      workoutDraftsReducer(
        { ...NO_DRAFTS, notes: [BENCH_PRESS_NOTE_DRAFT_ENTRY] },
        { entry: BENCH_PRESS_SKIP_DRAFT_ENTRY, type: "changedSkipDraft" },
      ),
    ).toStrictEqual({
      ...NO_DRAFTS,
      notes: [BENCH_PRESS_NOTE_DRAFT_ENTRY],
      skips: [BENCH_PRESS_SKIP_DRAFT_ENTRY],
    });
  });

  it("clears the skip Draft of a Workout exercise whose skip has nothing left to Save, keeping its note Draft", () => {
    expect(
      workoutDraftsReducer(
        {
          ...NO_DRAFTS,
          notes: [BENCH_PRESS_NOTE_DRAFT_ENTRY],
          skips: [BENCH_PRESS_SKIP_DRAFT_ENTRY],
        },
        {
          type: "clearedSkipDraft",
          workoutExerciseId: "bench-press-workout-exercise",
        },
      ),
    ).toStrictEqual({ ...NO_DRAFTS, notes: [BENCH_PRESS_NOTE_DRAFT_ENTRY] });
  });
});
