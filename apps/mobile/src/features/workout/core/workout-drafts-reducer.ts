import type { NoteDraft } from "#/features/workout/core/note-form-schema.ts";
import type { RecordedSetDraft } from "#/features/workout/core/recorded-set-form-schema.ts";
import type { SkipDraft } from "#/features/workout/core/skip-form-schema.ts";

export type WorkoutDrafts = {
  notes: readonly WorkoutExerciseDraftEntry<NoteDraft>[];
  recordedSets: readonly RecordedSetDraftEntry[];
  skips: readonly WorkoutExerciseDraftEntry<SkipDraft>[];
};

export type WorkoutDraftsAction =
  | { entry: RecordedSetDraftEntry; type: "changedRecordedSetDraft" }
  | { entry: WorkoutExerciseDraftEntry<NoteDraft>; type: "changedNoteDraft" }
  | { entry: WorkoutExerciseDraftEntry<SkipDraft>; type: "changedSkipDraft" }
  | {
      position: number;
      type: "clearedRecordedSetDraft";
      workoutExerciseId: string;
    }
  | {
      position: number;
      type: "removedRecordedSet";
      workoutExerciseId: string;
    }
  | { type: "clearedNoteDraft"; workoutExerciseId: string }
  | { type: "clearedSkipDraft"; workoutExerciseId: string };

type RecordedSetDraftEntry = WorkoutExerciseDraftEntry<RecordedSetDraft> & {
  position: number;
};

type WorkoutExerciseDraftEntry<TDraft> = {
  draft: TDraft;
  exerciseId: string;
  workoutExerciseId: string;
};

/**
 * Keeps every Draft of a Workout that has something to Save: one per
 * position of a Workout exercise's Sets, and one note and one skip per
 * Workout exercise.
 */
export function workoutDraftsReducer(
  drafts: WorkoutDrafts,
  action: WorkoutDraftsAction,
) {
  switch (action.type) {
    case "changedNoteDraft": {
      return {
        ...drafts,
        notes: upsertEntry({
          entries: drafts.notes,
          entry: action.entry,
          isSameEntry: (entry) =>
            entry.workoutExerciseId === action.entry.workoutExerciseId,
        }),
      };
    }
    case "changedRecordedSetDraft": {
      return {
        ...drafts,
        recordedSets: upsertEntry({
          entries: drafts.recordedSets,
          entry: action.entry,
          isSameEntry: (entry) =>
            entry.workoutExerciseId === action.entry.workoutExerciseId &&
            entry.position === action.entry.position,
        }),
      };
    }
    case "changedSkipDraft": {
      return {
        ...drafts,
        skips: upsertEntry({
          entries: drafts.skips,
          entry: action.entry,
          isSameEntry: (entry) =>
            entry.workoutExerciseId === action.entry.workoutExerciseId,
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
    case "clearedRecordedSetDraft": {
      return {
        ...drafts,
        recordedSets: drafts.recordedSets.filter(
          (entry) =>
            entry.workoutExerciseId !== action.workoutExerciseId ||
            entry.position !== action.position,
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
    case "removedRecordedSet": {
      return {
        ...drafts,
        recordedSets: drafts.recordedSets
          .filter(
            (entry) =>
              entry.workoutExerciseId !== action.workoutExerciseId ||
              entry.position !== action.position,
          )
          .map((entry) =>
            entry.workoutExerciseId === action.workoutExerciseId &&
            entry.position > action.position
              ? { ...entry, position: entry.position - 1 }
              : entry,
          ),
      };
    }
  }
}

/**
 * Replaces the entry that `isSameEntry` finds with `entry`, or adds `entry`
 * when there's none.
 */
function upsertEntry<TEntry>({
  entries,
  entry,
  isSameEntry,
}: {
  entries: readonly TEntry[];
  entry: TEntry;
  isSameEntry: (entry: TEntry) => boolean;
}) {
  return entries.some(isSameEntry)
    ? entries.map((existingEntry) =>
        isSameEntry(existingEntry) ? entry : existingEntry,
      )
    : [...entries, entry];
}
