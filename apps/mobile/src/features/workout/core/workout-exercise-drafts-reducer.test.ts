import { workoutExerciseDraftsReducer } from "#/features/workout/core/workout-exercise-drafts-reducer.ts";

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

describe("workoutExerciseDraftsReducer", () => {
  it("adds the note Draft of a Workout exercise whose note the User starts editing", () => {
    expect(
      workoutExerciseDraftsReducer(
        { notes: [BENCH_PRESS_NOTE_DRAFT_ENTRY], skips: [] },
        { entry: PUSH_UP_NOTE_DRAFT_ENTRY, type: "changedNoteDraft" },
      ),
    ).toStrictEqual({
      notes: [BENCH_PRESS_NOTE_DRAFT_ENTRY, PUSH_UP_NOTE_DRAFT_ENTRY],
      skips: [],
    });
  });

  it("replaces the note Draft of a Workout exercise whose note the User keeps editing", () => {
    expect(
      workoutExerciseDraftsReducer(
        { notes: [BENCH_PRESS_NOTE_DRAFT_ENTRY], skips: [] },
        {
          entry: {
            ...BENCH_PRESS_NOTE_DRAFT_ENTRY,
            draft: { note: "Felt very strong" },
          },
          type: "changedNoteDraft",
        },
      ),
    ).toStrictEqual({
      notes: [
        {
          ...BENCH_PRESS_NOTE_DRAFT_ENTRY,
          draft: { note: "Felt very strong" },
        },
      ],
      skips: [],
    });
  });

  it("clears the note Draft of a Workout exercise whose note has nothing left to Save, keeping its skip Draft", () => {
    expect(
      workoutExerciseDraftsReducer(
        {
          notes: [BENCH_PRESS_NOTE_DRAFT_ENTRY, PUSH_UP_NOTE_DRAFT_ENTRY],
          skips: [BENCH_PRESS_SKIP_DRAFT_ENTRY],
        },
        {
          type: "clearedNoteDraft",
          workoutExerciseId: "bench-press-workout-exercise",
        },
      ),
    ).toStrictEqual({
      notes: [PUSH_UP_NOTE_DRAFT_ENTRY],
      skips: [BENCH_PRESS_SKIP_DRAFT_ENTRY],
    });
  });

  it("adds the skip Draft of a Workout exercise whose skip the User starts editing", () => {
    expect(
      workoutExerciseDraftsReducer(
        { notes: [BENCH_PRESS_NOTE_DRAFT_ENTRY], skips: [] },
        { entry: BENCH_PRESS_SKIP_DRAFT_ENTRY, type: "changedSkipDraft" },
      ),
    ).toStrictEqual({
      notes: [BENCH_PRESS_NOTE_DRAFT_ENTRY],
      skips: [BENCH_PRESS_SKIP_DRAFT_ENTRY],
    });
  });

  it("clears the skip Draft of a Workout exercise whose skip has nothing left to Save, keeping its note Draft", () => {
    expect(
      workoutExerciseDraftsReducer(
        {
          notes: [BENCH_PRESS_NOTE_DRAFT_ENTRY],
          skips: [BENCH_PRESS_SKIP_DRAFT_ENTRY],
        },
        {
          type: "clearedSkipDraft",
          workoutExerciseId: "bench-press-workout-exercise",
        },
      ),
    ).toStrictEqual({ notes: [BENCH_PRESS_NOTE_DRAFT_ENTRY], skips: [] });
  });
});
