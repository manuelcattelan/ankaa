import type { ReactNode } from "react";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useReducer, useState } from "react";

import type { FailedWorkoutSave } from "@/features/workout/core/get-unsynced-workout-document";
import type { WorkoutDocument } from "@/features/workout/core/workout-document-schema";
import type { WorkoutDocumentsAction } from "@/features/workout/core/workout-documents-reducer";
import type { ApplicationRuntime } from "@/layer";

import { buildWorkoutSaveInput } from "@/features/workout/core/build-workout-save-input";
import { getUnsyncedWorkoutDocument } from "@/features/workout/core/get-unsynced-workout-document";
import { hasWorkoutSaveFailed } from "@/features/workout/core/has-workout-save-failed";
import { workoutDocumentsReducer } from "@/features/workout/core/workout-documents-reducer";
import { readWorkoutDocuments } from "@/features/workout/interactors/read-workout-documents";
import { writeWorkoutDocuments } from "@/features/workout/interactors/write-workout-documents";
import { createWorkoutSaveMutationOptions } from "@/features/workout/mutations/create-workout-save-mutation-options";
import { WorkoutDocumentsContext } from "@/features/workout/providers/workout-documents-context";
import { useAuthenticationClient } from "@/shared/hooks/use-authentication-client";
import { useRuntime } from "@/shared/hooks/use-runtime";

type UseWorkoutSyncOptions = {
  dispatchWorkoutDocumentsAction: (
    workoutDocumentsAction: WorkoutDocumentsAction,
  ) => void;
  workoutDocuments: WorkoutDocument[];
};

type WorkoutDocumentsProviderProperties = {
  children: ReactNode;
};

const WORKOUT_SAVE_DEBOUNCE_MILLISECONDS = 2_000;

const FAILED_WORKOUT_SAVES_INITIAL_VALUE: FailedWorkoutSave[] = [];

export function WorkoutDocumentsProvider({
  children,
}: WorkoutDocumentsProviderProperties) {
  const runtime = useRuntime();

  const authenticationClient = useAuthenticationClient();

  const session = authenticationClient.betterAuthenticationClient.useSession();

  const [workoutDocuments, dispatchWorkoutDocumentsAction] = useReducer(
    workoutDocumentsReducer,
    runtime,
    readStoredWorkoutDocuments,
  );

  const sessionWorkoutDocuments = workoutDocuments.filter(
    (workoutDocument) => workoutDocument.userId === session.data?.user.id,
  );

  const hasSessionWorkoutSaveFailed = useWorkoutSync({
    dispatchWorkoutDocumentsAction,
    workoutDocuments: sessionWorkoutDocuments,
  });

  const runningWorkoutDocument = sessionWorkoutDocuments.find(
    (sessionWorkoutDocument) => sessionWorkoutDocument.endedAt === undefined,
  );

  useEffect(() => {
    runtime.runSync(writeWorkoutDocuments(workoutDocuments));
  }, [runtime, workoutDocuments]);

  return (
    <WorkoutDocumentsContext
      value={{
        dispatchWorkoutDocumentsAction,
        hasWorkoutSaveFailed: hasSessionWorkoutSaveFailed,
        runningWorkoutDocument,
      }}
    >
      {children}
    </WorkoutDocumentsContext>
  );
}

function readStoredWorkoutDocuments(runtime: ApplicationRuntime) {
  return runtime.runSync(readWorkoutDocuments());
}

function useWorkoutSync({
  dispatchWorkoutDocumentsAction,
  workoutDocuments,
}: UseWorkoutSyncOptions) {
  const runtime = useRuntime();

  const [failedWorkoutSaves, setFailedWorkoutSaves] = useState(
    FAILED_WORKOUT_SAVES_INITIAL_VALUE,
  );

  const saveWorkout = useMutation({
    ...createWorkoutSaveMutationOptions(runtime),
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
  });

  const unsyncedWorkoutDocument = getUnsyncedWorkoutDocument({
    failedWorkoutSaves,
    workoutDocuments,
  });

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

  return hasWorkoutSaveFailed({ failedWorkoutSaves, workoutDocuments });
}
