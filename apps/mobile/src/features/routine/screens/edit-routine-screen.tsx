import type { ComponentProps } from "react";

import { useQuery } from "@tanstack/react-query";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator } from "react-native";

import { RoutineEditor } from "@/features/routine/components/routine-editor";
import { editRoutineScreenMessages } from "@/features/routine/messages/edit-routine-screen-messages";
import { createRoutineListQueryOptions } from "@/features/routine/queries/create-routine-list-query-options";
import { useRuntime } from "@/shared/hooks/use-runtime";

type EditRoutineScreenProperties = Pick<
  ComponentProps<typeof RoutineEditor>,
  "renderExercisePicker"
> & {
  routineId: string;
};

export function EditRoutineScreen({
  renderExercisePicker,
  routineId,
}: EditRoutineScreenProperties) {
  const runtime = useRuntime();

  const routines = useQuery(createRoutineListQueryOptions(runtime));

  const editedRoutine = routines.data?.find(
    (routine) => routine.id === routineId,
  );

  return (
    <>
      <Stack.Screen options={{ title: editRoutineScreenMessages.title }} />
      {routines.isPending ? <ActivityIndicator /> : null}
      {editedRoutine ? (
        <RoutineEditor
          renderExercisePicker={renderExercisePicker}
          routine={editedRoutine}
        />
      ) : null}
      {!routines.isPending && !editedRoutine ? <Redirect href="/" /> : null}
    </>
  );
}
