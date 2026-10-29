import type { NoteDraft } from "#/features/workout/core/note-form-schema.ts";
import type { SkipDraft } from "#/features/workout/core/skip-form-schema.ts";

export type WorkoutExerciseDraftEntry<TDraft> = {
  draft: TDraft;
  exerciseId: string;
  workoutExerciseId: string;
};

export type WorkoutExerciseDrafts = {
  notes: readonly WorkoutExerciseDraftEntry<NoteDraft>[];
  skips: readonly WorkoutExerciseDraftEntry<SkipDraft>[];
};

export type WorkoutExerciseDraftsAction =
  | { entry: WorkoutExerciseDraftEntry<NoteDraft>; type: "changedNoteDraft" }
  | { entry: WorkoutExerciseDraftEntry<SkipDraft>; type: "changedSkipDraft" }
  | { type: "clearedNoteDraft"; workoutExerciseId: string }
  | { type: "clearedSkipDraft"; workoutExerciseId: string };

/**
 * Keeps the note Draft and the skip Draft of every Workout exercise of a
 * Workout that has something to Save.
 */
export function workoutExerciseDraftsReducer(
  drafts: WorkoutExerciseDrafts,
  action: WorkoutExerciseDraftsAction,
) {
  switch (action.type) {
    case "changedNoteDraft": {
      return {
        ...drafts,
        notes: changeEntry({
          changedEntry: action.entry,
          entries: drafts.notes,
        }),
      };
    }
    case "changedSkipDraft": {
      return {
        ...drafts,
        skips: changeEntry({
          changedEntry: action.entry,
          entries: drafts.skips,
        }),
      };
    }
    case "clearedNoteDraft": {
      return {
        ...drafts,
        notes: drafts.notes.filter(
          (entry) => entry.workoutExerciseId !== action.workoutExerciseId,
        ),
      };
    }
    case "clearedSkipDraft": {
      return {
        ...drafts,
        skips: drafts.skips.filter(
          (entry) => entry.workoutExerciseId !== action.workoutExerciseId,
        ),
      };
    }
  }
}

/**
 * Replaces the entry of the Workout exercise of `changedEntry`, or adds it
 * when the Workout exercise has none yet.
 */
function changeEntry<TDraft>({
  changedEntry,
  entries,
}: {
  changedEntry: WorkoutExerciseDraftEntry<TDraft>;
  entries: readonly WorkoutExerciseDraftEntry<TDraft>[];
}) {
  const hasEntry = entries.some(
    (entry) => entry.workoutExerciseId === changedEntry.workoutExerciseId,
  );

  return hasEntry
    ? entries.map((entry) =>
        entry.workoutExerciseId === changedEntry.workoutExerciseId
          ? changedEntry
          : entry,
      )
    : [...entries, changedEntry];
}
