import type { ComponentProps } from "react";

import { useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { ActivityIndicator } from "react-native";

import { RoutineDeleteButton } from "#/features/routine/components/routine-delete-button.tsx";
import { RoutineEditor } from "#/features/routine/components/routine-editor.tsx";
import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";
import { routineListQueryOptions } from "#/features/routine/queries/routine-list-query-options.ts";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { getTrpcErrorMessage } from "#/shared/core/get-trpc-error-message.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";

export function RoutineScreen({
  renderExercisePicker,
  routineId,
}: Pick<ComponentProps<typeof RoutineEditor>, "renderExercisePicker"> & {
  routineId: string;
}) {
  const runtime = useRuntime();

  const routines = useQuery(routineListQueryOptions(runtime));

  const routine =
    routines.data?.find((listedRoutine) => listedRoutine.id === routineId) ??
    null;
  const statusMessage = getStatusMessage();

  function getStatusMessage() {
    if (routines.error !== null) {
      return getTrpcErrorMessage(routines.error);
    }

    return routines.isSuccess && routine === null
      ? ROUTINE_MESSAGES.routineNotFoundError
      : null;
  }

  return (
    <>
      <Stack.Screen options={{ title: ROUTINE_MESSAGES.routineScreenTitle }} />
      {routines.isPending ? <ActivityIndicator /> : null}
      <StatusMessage message={statusMessage} />
      {routine === null ? null : (
        <RoutineEditor
          key={routine.id}
          renderExercisePicker={renderExercisePicker}
          routine={routine}
        >
          <RoutineDeleteButton routineId={routine.id} />
        </RoutineEditor>
      )}
    </>
  );
}
