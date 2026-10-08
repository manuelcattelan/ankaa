import type { AppRouter } from "@ankaa/api";
import type { WeightType } from "@ankaa/database/constants";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { inferRouterInputs } from "@trpc/server";

import { AMOUNT_MINIMUM } from "@ankaa/database/constants";
import { useMutation } from "@tanstack/react-query";
import * as ExpoSqliteKeyValueStore from "expo-sqlite/kv-store";
import { useEffect, useReducer, useState } from "react";

import type {
  WorkoutDocument,
  WorkoutDocumentExercise,
  WorkoutDocumentExerciseSet,
  WorkoutDocumentExerciseSetSegment,
  WorkoutDocumentsAction,
} from "@/utilities/workout-documents";

import { authenticationClient } from "@/clients/authentication";
import { useTrpc } from "@/clients/trpc";
import { WorkoutDocumentsContext } from "@/clients/workout-documents";
import {
  convertUndefinedToNull,
  parseOptionalWholeNumber,
  parseWeightValue,
} from "@/utilities/conversion";
import { getWholeNumberValidationError } from "@/utilities/validation";
import {
  getWorkoutDocumentRoutineExerciseSet,
  workoutDocumentSchema,
} from "@/utilities/workout-documents";

type BuildWorkoutExerciseSetSegmentSaveInputOptions = {
  position: number;
  weightType: WeightType;
  workoutDocumentExerciseSetSegment: WorkoutDocumentExerciseSetSegment;
};

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

type FailedWorkoutSave = {
  version: number;
  workoutId: string;
};

type GetUnsyncedWorkoutDocumentOptions = {
  failedWorkoutSaves: FailedWorkoutSave[];
  workoutDocuments: WorkoutDocument[];
};

type HasFailedWorkoutSaveOptions = {
  failedWorkoutSaves: FailedWorkoutSave[];
  workoutDocument: WorkoutDocument;
};

type UseWorkoutSyncOptions = {
  dispatchWorkoutDocumentsAction: (
    workoutDocumentsAction: WorkoutDocumentsAction,
  ) => void;
  workoutDocuments: WorkoutDocument[];
};

type WorkoutDocumentsProviderProperties = {
  children: React.ReactNode;
};

type WorkoutExerciseSetSegmentSaveInput =
  WorkoutSaveInput["exercises"][number]["sets"][number]["segments"][number];

type WorkoutSaveInput = inferRouterInputs<AppRouter>["workout"]["save"];

const WORKOUT_DOCUMENT_STORAGE_KEY_PREFIX = "workout-document:";

const WORKOUT_SAVE_DEBOUNCE_MILLISECONDS = 2_000;

const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

const FAILED_WORKOUT_SAVES_INITIAL_VALUE: FailedWorkoutSave[] = [];

export function WorkoutDocumentsProvider({
  children,
}: WorkoutDocumentsProviderProperties) {
  const session = authenticationClient.useSession();

  const [workoutDocuments, dispatchWorkoutDocumentsAction] = useReducer(
    workoutDocumentsReducer,
    undefined,
    readWorkoutDocuments,
  );

  const sessionWorkoutDocuments = workoutDocuments.filter(
    (workoutDocument) => workoutDocument.userId === session.data?.user.id,
  );

  const hasWorkoutSaveFailed = useWorkoutSync({
    dispatchWorkoutDocumentsAction,
    workoutDocuments: sessionWorkoutDocuments,
  });

  const runningWorkoutDocument = sessionWorkoutDocuments.find(
    (sessionWorkoutDocument) => sessionWorkoutDocument.endedAt === undefined,
  );

  useEffect(() => {
    writeWorkoutDocuments(workoutDocuments);
  }, [workoutDocuments]);

  return (
    <WorkoutDocumentsContext
      value={{
        dispatchWorkoutDocumentsAction,
        hasWorkoutSaveFailed,
        runningWorkoutDocument,
      }}
    >
      {children}
    </WorkoutDocumentsContext>
  );
}

function buildWorkoutExerciseSetSegmentSaveInput({
  position,
  weightType,
  workoutDocumentExerciseSetSegment,
}: BuildWorkoutExerciseSetSegmentSaveInputOptions) {
  const isWeightAllowed = weightType !== "none";
  const amountValidationError = getWholeNumberValidationError({
    isRequired: false,
    minimum: AMOUNT_MINIMUM,
    wholeNumberText: workoutDocumentExerciseSetSegment.amount,
  });

  return {
    amount: parseOptionalWholeNumber(
      amountValidationError ? "" : workoutDocumentExerciseSetSegment.amount,
    ),
    id: workoutDocumentExerciseSetSegment.id,
    position,
    weightUnit: convertUndefinedToNull(
      isWeightAllowed
        ? workoutDocumentExerciseSetSegment.weightUnit
        : undefined,
    ),
    weightValue: convertUndefinedToNull(
      isWeightAllowed
        ? parseWeightValue(workoutDocumentExerciseSetSegment.weightValue)
        : undefined,
    ),
  } satisfies WorkoutExerciseSetSegmentSaveInput;
}

function buildWorkoutSaveInput(workoutDocument: WorkoutDocument) {
  return {
    endedAt: convertUndefinedToNull(workoutDocument.endedAt),
    exercises: workoutDocument.exercises.map(
      (workoutDocumentExercise, position) => ({
        amountUnit: workoutDocumentExercise.amountUnit,
        exerciseId: workoutDocumentExercise.exerciseId,
        id: workoutDocumentExercise.id,
        note: convertUndefinedToNull(
          workoutDocumentExercise.note.trim() || undefined,
        ),
        position,
        section: workoutDocumentExercise.section,
        sets: workoutDocumentExercise.sets.map(
          (workoutDocumentExerciseSet, setPosition) => ({
            id: workoutDocumentExerciseSet.id,
            isToFailure: workoutDocumentExerciseSet.isToFailure,
            position: setPosition,
            segments: workoutDocumentExerciseSet.segments.map(
              (workoutDocumentExerciseSetSegment, segmentPosition) =>
                buildWorkoutExerciseSetSegmentSaveInput({
                  position: segmentPosition,
                  weightType: workoutDocumentExercise.weightType,
                  workoutDocumentExerciseSetSegment,
                }),
            ),
            setType: workoutDocumentExerciseSet.setType,
            tempo: convertUndefinedToNull(workoutDocumentExerciseSet.tempo),
            variation: convertUndefinedToNull(
              workoutDocumentExerciseSet.variation,
            ),
          }),
        ),
        skipReason: convertUndefinedToNull(workoutDocumentExercise.skipReason),
        skipReasonNote: convertUndefinedToNull(
          workoutDocumentExercise.skipReason
            ? workoutDocumentExercise.skipReasonNote.trim() || undefined
            : undefined,
        ),
        superset: convertUndefinedToNull(workoutDocumentExercise.superset),
        warmUpForWorkoutExerciseId: convertUndefinedToNull(
          workoutDocumentExercise.warmUpForWorkoutExerciseId,
        ),
        weightType: workoutDocumentExercise.weightType,
      }),
    ),
    id: workoutDocument.id,
    routineId: workoutDocument.routineId,
    startedAt: workoutDocument.startedAt,
    version: workoutDocument.version,
  } satisfies WorkoutSaveInput;
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

function getUnsyncedWorkoutDocument({
  failedWorkoutSaves,
  workoutDocuments,
}: GetUnsyncedWorkoutDocumentOptions) {
  const unsyncedWorkoutDocuments = workoutDocuments.filter(
    (workoutDocument) =>
      workoutDocument.version > workoutDocument.syncedVersion &&
      !hasFailedWorkoutSave({ failedWorkoutSaves, workoutDocument }),
  );

  const oldestEndedWorkoutDocument = unsyncedWorkoutDocuments.reduce<
    undefined | WorkoutDocument
  >(
    (olderEndedWorkoutDocument, unsyncedWorkoutDocument) =>
      unsyncedWorkoutDocument.endedAt !== undefined &&
      (olderEndedWorkoutDocument?.endedAt === undefined ||
        unsyncedWorkoutDocument.endedAt < olderEndedWorkoutDocument.endedAt)
        ? unsyncedWorkoutDocument
        : olderEndedWorkoutDocument,
    undefined,
  );

  return (
    oldestEndedWorkoutDocument ??
    unsyncedWorkoutDocuments.find(
      (unsyncedWorkoutDocument) =>
        unsyncedWorkoutDocument.endedAt === undefined,
    )
  );
}

function getWorkoutDocumentStorageKey(workoutId: string) {
  return `${WORKOUT_DOCUMENT_STORAGE_KEY_PREFIX}${workoutId}`;
}

function getWorkoutDocumentStorageKeys() {
  return ExpoSqliteKeyValueStore.Storage.getAllKeysSync().filter((storageKey) =>
    storageKey.startsWith(WORKOUT_DOCUMENT_STORAGE_KEY_PREFIX),
  );
}

function hasFailedWorkoutSave({
  failedWorkoutSaves,
  workoutDocument,
}: HasFailedWorkoutSaveOptions) {
  return failedWorkoutSaves.some(
    (failedWorkoutSave) =>
      failedWorkoutSave.workoutId === workoutDocument.id &&
      failedWorkoutSave.version === workoutDocument.version,
  );
}

function isWorkoutSaveErrorRetryable(error: TRPCClientErrorLike<AppRouter>) {
  return (
    !error.data || error.data.httpStatus >= HTTP_STATUS_INTERNAL_SERVER_ERROR
  );
}

function readWorkoutDocument(workoutDocumentStorageKey: string) {
  const workoutDocumentJson = ExpoSqliteKeyValueStore.Storage.getItemSync(
    workoutDocumentStorageKey,
  );

  if (!workoutDocumentJson) {
    return undefined;
  }

  const parsedWorkoutDocument = workoutDocumentSchema.safeParse(
    JSON.parse(workoutDocumentJson),
  );

  return parsedWorkoutDocument.success ? parsedWorkoutDocument.data : undefined;
}

function readWorkoutDocuments() {
  return getWorkoutDocumentStorageKeys().flatMap(
    (workoutDocumentStorageKey) => {
      const workoutDocument = readWorkoutDocument(workoutDocumentStorageKey);

      return workoutDocument ? [workoutDocument] : [];
    },
  );
}

function useWorkoutSync({
  dispatchWorkoutDocumentsAction,
  workoutDocuments,
}: UseWorkoutSyncOptions) {
  const trpc = useTrpc();

  const [failedWorkoutSaves, setFailedWorkoutSaves] = useState(
    FAILED_WORKOUT_SAVES_INITIAL_VALUE,
  );

  const saveWorkout = useMutation(
    trpc.workout.save.mutationOptions({
      onError: (error, workoutSaveInput) => {
        setFailedWorkoutSaves((previousFailedWorkoutSaves) => [
          ...previousFailedWorkoutSaves,
          { version: workoutSaveInput.version, workoutId: workoutSaveInput.id },
        ]);
      },
      onSuccess: (data, workoutSaveInput) => {
        dispatchWorkoutDocumentsAction({
          type: "savedWorkout",
          version: workoutSaveInput.version,
          workoutId: workoutSaveInput.id,
        });
      },
      retry: (failureCount, error) => isWorkoutSaveErrorRetryable(error),
    }),
  );

  const unsyncedWorkoutDocument = getUnsyncedWorkoutDocument({
    failedWorkoutSaves,
    workoutDocuments,
  });
  const hasWorkoutSaveFailed = workoutDocuments.some(
    (workoutDocument) =>
      workoutDocument.version > workoutDocument.syncedVersion &&
      failedWorkoutSaves.some(
        (failedWorkoutSave) =>
          failedWorkoutSave.workoutId === workoutDocument.id,
      ),
  );

  useEffect(() => {
    if (!unsyncedWorkoutDocument || saveWorkout.isPending) {
      return;
    }

    const workoutSaveTimeout = setTimeout(() => {
      saveWorkout.mutate(buildWorkoutSaveInput(unsyncedWorkoutDocument));
    }, WORKOUT_SAVE_DEBOUNCE_MILLISECONDS);

    return () => {
      clearTimeout(workoutSaveTimeout);
    };
  }, [saveWorkout, unsyncedWorkoutDocument]);

  return hasWorkoutSaveFailed;
}

function workoutDocumentsReducer(
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

function writeWorkoutDocuments(workoutDocuments: WorkoutDocument[]) {
  for (const workoutDocument of workoutDocuments) {
    const workoutDocumentStorageKey = getWorkoutDocumentStorageKey(
      workoutDocument.id,
    );
    const workoutDocumentJson = JSON.stringify(workoutDocument);

    if (
      ExpoSqliteKeyValueStore.Storage.getItemSync(workoutDocumentStorageKey) !==
      workoutDocumentJson
    ) {
      ExpoSqliteKeyValueStore.Storage.setItemSync(
        workoutDocumentStorageKey,
        workoutDocumentJson,
      );
    }
  }

  const workoutDocumentStorageKeys = new Set(
    workoutDocuments.map((workoutDocument) =>
      getWorkoutDocumentStorageKey(workoutDocument.id),
    ),
  );

  for (const storedWorkoutDocumentStorageKey of getWorkoutDocumentStorageKeys()) {
    if (
      !workoutDocumentStorageKeys.has(storedWorkoutDocumentStorageKey) &&
      readWorkoutDocument(storedWorkoutDocumentStorageKey)
    ) {
      ExpoSqliteKeyValueStore.Storage.removeItemSync(
        storedWorkoutDocumentStorageKey,
      );
    }
  }
}
