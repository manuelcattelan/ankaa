import type { RecordedSetDraft } from "#/features/workout/core/recorded-set-form-schema.ts";

export type RecordedSetDraftEntry = {
  draft: RecordedSetDraft;
  exerciseId: string;
  position: number;
  workoutExerciseId: string;
};

export type RecordedSetDraftsAction =
  | {
      entry: RecordedSetDraftEntry;
      type: "changedRecordedSetDraft";
    }
  | {
      position: number;
      type: "clearedRecordedSetDraft";
      workoutExerciseId: string;
    }
  | {
      position: number;
      type: "removedRecordedSet";
      workoutExerciseId: string;
    };

/**
 * Keeps the Draft of every Set of a Workout that has something to Save, one
 * per position of a Workout exercise.
 */
export function recordedSetDraftsReducer(
  entries: readonly RecordedSetDraftEntry[],
  action: RecordedSetDraftsAction,
) {
  switch (action.type) {
    case "changedRecordedSetDraft": {
      const hasEntry = entries.some(
        (entry) =>
          entry.workoutExerciseId === action.entry.workoutExerciseId &&
          entry.position === action.entry.position,
      );

      return hasEntry
        ? entries.map((entry) =>
            entry.workoutExerciseId === action.entry.workoutExerciseId &&
            entry.position === action.entry.position
              ? action.entry
              : entry,
          )
        : [...entries, action.entry];
    }
    case "clearedRecordedSetDraft": {
      return entries.filter(
        (entry) =>
          entry.workoutExerciseId !== action.workoutExerciseId ||
          entry.position !== action.position,
      );
    }
    case "removedRecordedSet": {
      return entries
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
        );
    }
  }
}
