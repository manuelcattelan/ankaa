import type { SkipReason } from "@ankaa/core/features/workout/constants/skip-reason";

import type {
  WorkoutDocument,
  WorkoutDocumentExercise,
  WorkoutDocumentExerciseSet,
  WorkoutDocumentExerciseSetSegment,
  WorkoutDocumentRestTimer,
} from "@/features/workout/core/workout-document-schema";

import { getWorkoutDocumentRoutineExerciseSet } from "@/features/workout/core/get-workout-document-routine-exercise-set";

export type WorkoutDocumentsAction =
  | { endedAt: string; type: "stoppedWorkout"; workoutId: string }
  | {
      note: string;
      type: "changedExerciseNote";
      workoutExerciseId: string;
      workoutId: string;
    }
  | {
      restTimer: WorkoutDocumentRestTimer;
      type: "startedRestTimer";
      workoutId: string;
    }
  | {
      skipReason: SkipReason | undefined;
      type: "changedSkipReason";
      workoutExerciseId: string;
      workoutId: string;
    }
  | {
      skipReasonNote: string;
      type: "changedSkipReasonNote";
      workoutExerciseId: string;
      workoutId: string;
    }
  | {
      type: "addedSegment";
      workoutExerciseId: string;
      workoutExerciseSetId: string;
      workoutExerciseSetSegmentId: string;
      workoutId: string;
    }
  | {
      type: "addedSet";
      workoutExerciseId: string;
      workoutExerciseSetId: string;
      workoutExerciseSetSegmentId: string;
      workoutId: string;
    }
  | {
      type: "changedSegment";
      workoutExerciseId: string;
      workoutExerciseSetId: string;
      workoutExerciseSetSegment: WorkoutDocumentExerciseSetSegment;
      workoutId: string;
    }
  | { type: "removedSet"; workoutExerciseId: string; workoutId: string }
  | { type: "savedWorkout"; version: number; workoutId: string }
  | { type: "skippedRest"; workoutId: string }
  | { type: "startedWorkout"; workoutDocument: WorkoutDocument };

type ChangeWorkoutDocumentExerciseOptions = {
  getWorkoutDocumentExerciseChanges: (
    workoutDocumentExercise: WorkoutDocumentExercise,
  ) => Partial<WorkoutDocumentExercise>;
  workoutDocuments: WorkoutDocument[];
  workoutExerciseId: string;
  workoutId: string;
};

type ChangeWorkoutDocumentExerciseSetOptions = {
  getWorkoutDocumentExerciseSetChanges: (
    workoutDocumentExerciseSet: WorkoutDocumentExerciseSet,
  ) => Partial<WorkoutDocumentExerciseSet>;
  workoutDocuments: WorkoutDocument[];
  workoutExerciseId: string;
  workoutExerciseSetId: string;
  workoutId: string;
};

type ChangeWorkoutDocumentOptions = {
  getWorkoutDocumentChanges: (
    workoutDocument: WorkoutDocument,
  ) => Partial<WorkoutDocument>;
  workoutDocuments: WorkoutDocument[];
  workoutId: string;
};

type CreateWorkoutDocumentExerciseSetSegmentOptions = {
  workoutDocumentExercise: WorkoutDocumentExercise;
  workoutExerciseSetSegmentId: string;
};

export function workoutDocumentsReducer(
  workoutDocuments: WorkoutDocument[],
  workoutDocumentsAction: WorkoutDocumentsAction,
) {
  switch (workoutDocumentsAction.type) {
    case "addedSegment": {
      return changeWorkoutDocumentExercise({
        getWorkoutDocumentExerciseChanges: (workoutDocumentExercise) => ({
          sets: workoutDocumentExercise.sets.map(
            (workoutDocumentExerciseSet) =>
              workoutDocumentExerciseSet.id ===
              workoutDocumentsAction.workoutExerciseSetId
                ? {
                    ...workoutDocumentExerciseSet,
                    segments: [
                      ...workoutDocumentExerciseSet.segments,
                      createWorkoutDocumentExerciseSetSegment({
                        workoutDocumentExercise,
                        workoutExerciseSetSegmentId:
                          workoutDocumentsAction.workoutExerciseSetSegmentId,
                      }),
                    ],
                  }
                : workoutDocumentExerciseSet,
          ),
        }),
        workoutDocuments,
        workoutExerciseId: workoutDocumentsAction.workoutExerciseId,
        workoutId: workoutDocumentsAction.workoutId,
      });
    }

    case "addedSet": {
      return changeWorkoutDocumentExercise({
        getWorkoutDocumentExerciseChanges: (workoutDocumentExercise) => {
          const workoutDocumentRoutineExerciseSet =
            getWorkoutDocumentRoutineExerciseSet({
              position: workoutDocumentExercise.sets.length,
              workoutDocumentExercise,
            });

          return {
            sets: [
              ...workoutDocumentExercise.sets,
              {
                id: workoutDocumentsAction.workoutExerciseSetId,
                isToFailure:
                  workoutDocumentRoutineExerciseSet?.isToFailure ?? false,
                segments: [
                  createWorkoutDocumentExerciseSetSegment({
                    workoutDocumentExercise,
                    workoutExerciseSetSegmentId:
                      workoutDocumentsAction.workoutExerciseSetSegmentId,
                  }),
                ],
                setType:
                  workoutDocumentRoutineExerciseSet?.setType ?? "working",
                tempo: workoutDocumentRoutineExerciseSet?.tempo,
                variation: workoutDocumentRoutineExerciseSet?.variation,
              },
            ],
          };
        },
        workoutDocuments,
        workoutExerciseId: workoutDocumentsAction.workoutExerciseId,
        workoutId: workoutDocumentsAction.workoutId,
      });
    }

    case "changedExerciseNote": {
      return changeWorkoutDocumentExercise({
        getWorkoutDocumentExerciseChanges: () => ({
          note: workoutDocumentsAction.note,
        }),
        workoutDocuments,
        workoutExerciseId: workoutDocumentsAction.workoutExerciseId,
        workoutId: workoutDocumentsAction.workoutId,
      });
    }

    case "changedSegment": {
      return changeWorkoutDocumentExerciseSet({
        getWorkoutDocumentExerciseSetChanges: (workoutDocumentExerciseSet) => ({
          segments: workoutDocumentExerciseSet.segments.map(
            (workoutDocumentExerciseSetSegment) =>
              workoutDocumentExerciseSetSegment.id ===
              workoutDocumentsAction.workoutExerciseSetSegment.id
                ? workoutDocumentsAction.workoutExerciseSetSegment
                : workoutDocumentExerciseSetSegment,
          ),
        }),
        workoutDocuments,
        workoutExerciseId: workoutDocumentsAction.workoutExerciseId,
        workoutExerciseSetId: workoutDocumentsAction.workoutExerciseSetId,
        workoutId: workoutDocumentsAction.workoutId,
      });
    }

    case "changedSkipReason": {
      return changeWorkoutDocumentExercise({
        getWorkoutDocumentExerciseChanges: () => ({
          skipReason: workoutDocumentsAction.skipReason,
        }),
        workoutDocuments,
        workoutExerciseId: workoutDocumentsAction.workoutExerciseId,
        workoutId: workoutDocumentsAction.workoutId,
      });
    }

    case "changedSkipReasonNote": {
      return changeWorkoutDocumentExercise({
        getWorkoutDocumentExerciseChanges: () => ({
          skipReasonNote: workoutDocumentsAction.skipReasonNote,
        }),
        workoutDocuments,
        workoutExerciseId: workoutDocumentsAction.workoutExerciseId,
        workoutId: workoutDocumentsAction.workoutId,
      });
    }

    case "removedSet": {
      return changeWorkoutDocumentExercise({
        getWorkoutDocumentExerciseChanges: (workoutDocumentExercise) => ({
          sets: workoutDocumentExercise.sets.slice(
            0,
            workoutDocumentExercise.sets.length - 1,
          ),
        }),
        workoutDocuments,
        workoutExerciseId: workoutDocumentsAction.workoutExerciseId,
        workoutId: workoutDocumentsAction.workoutId,
      });
    }

    case "savedWorkout": {
      return workoutDocuments.flatMap((workoutDocument) => {
        if (workoutDocument.id !== workoutDocumentsAction.workoutId) {
          return [workoutDocument];
        }

        const syncedVersion = Math.max(
          workoutDocument.syncedVersion,
          workoutDocumentsAction.version,
        );

        if (
          workoutDocument.endedAt !== undefined &&
          syncedVersion >= workoutDocument.version
        ) {
          return [];
        }

        return [{ ...workoutDocument, syncedVersion }];
      });
    }

    case "skippedRest": {
      return changeWorkoutDocument({
        getWorkoutDocumentChanges: () => ({ restTimer: undefined }),
        workoutDocuments,
        workoutId: workoutDocumentsAction.workoutId,
      });
    }

    case "startedRestTimer": {
      return changeWorkoutDocument({
        getWorkoutDocumentChanges: () => ({
          restTimer: workoutDocumentsAction.restTimer,
        }),
        workoutDocuments,
        workoutId: workoutDocumentsAction.workoutId,
      });
    }

    case "startedWorkout": {
      return [...workoutDocuments, workoutDocumentsAction.workoutDocument];
    }

    case "stoppedWorkout": {
      return changeWorkoutDocument({
        getWorkoutDocumentChanges: () => ({
          endedAt: workoutDocumentsAction.endedAt,
          restTimer: undefined,
        }),
        workoutDocuments,
        workoutId: workoutDocumentsAction.workoutId,
      });
    }
  }
}

function changeWorkoutDocument({
  getWorkoutDocumentChanges,
  workoutDocuments,
  workoutId,
}: ChangeWorkoutDocumentOptions) {
  return workoutDocuments.map((workoutDocument) =>
    workoutDocument.id === workoutId
      ? {
          ...workoutDocument,
          ...getWorkoutDocumentChanges(workoutDocument),
          version: workoutDocument.version + 1,
        }
      : workoutDocument,
  );
}

function changeWorkoutDocumentExercise({
  getWorkoutDocumentExerciseChanges,
  workoutDocuments,
  workoutExerciseId,
  workoutId,
}: ChangeWorkoutDocumentExerciseOptions) {
  return changeWorkoutDocument({
    getWorkoutDocumentChanges: (workoutDocument) => ({
      exercises: workoutDocument.exercises.map((workoutDocumentExercise) =>
        workoutDocumentExercise.id === workoutExerciseId
          ? {
              ...workoutDocumentExercise,
              ...getWorkoutDocumentExerciseChanges(workoutDocumentExercise),
            }
          : workoutDocumentExercise,
      ),
    }),
    workoutDocuments,
    workoutId,
  });
}

function changeWorkoutDocumentExerciseSet({
  getWorkoutDocumentExerciseSetChanges,
  workoutDocuments,
  workoutExerciseId,
  workoutExerciseSetId,
  workoutId,
}: ChangeWorkoutDocumentExerciseSetOptions) {
  return changeWorkoutDocumentExercise({
    getWorkoutDocumentExerciseChanges: (workoutDocumentExercise) => ({
      sets: workoutDocumentExercise.sets.map((workoutDocumentExerciseSet) =>
        workoutDocumentExerciseSet.id === workoutExerciseSetId
          ? {
              ...workoutDocumentExerciseSet,
              ...getWorkoutDocumentExerciseSetChanges(
                workoutDocumentExerciseSet,
              ),
            }
          : workoutDocumentExerciseSet,
      ),
    }),
    workoutDocuments,
    workoutExerciseId,
    workoutId,
  });
}

function createWorkoutDocumentExerciseSetSegment({
  workoutDocumentExercise,
  workoutExerciseSetSegmentId,
}: CreateWorkoutDocumentExerciseSetSegmentOptions) {
  const lastWeightUnit = workoutDocumentExercise.sets
    .flatMap(
      (workoutDocumentExerciseSet) => workoutDocumentExerciseSet.segments,
    )
    .reduce<WorkoutDocumentExerciseSetSegment["weightUnit"]>(
      (previousWeightUnit, workoutDocumentExerciseSetSegment) =>
        workoutDocumentExerciseSetSegment.weightUnit ?? previousWeightUnit,
      undefined,
    );

  const workoutDocumentExerciseSetSegment: WorkoutDocumentExerciseSetSegment = {
    amount: "",
    id: workoutExerciseSetSegmentId,
    weightUnit:
      workoutDocumentExercise.weightType === "none"
        ? undefined
        : (lastWeightUnit ?? "kilogram"),
    weightValue: "",
  };

  return workoutDocumentExerciseSetSegment;
}
