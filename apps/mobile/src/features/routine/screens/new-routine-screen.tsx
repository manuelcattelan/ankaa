import type { ComponentProps } from "react";

import { Stack } from "expo-router";

import { RoutineEditor } from "#/features/routine/components/routine-editor.tsx";
import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";

export function NewRoutineScreen({
  renderExercisePicker,
}: Pick<ComponentProps<typeof RoutineEditor>, "renderExercisePicker">) {
  return (
    <>
      <Stack.Screen
        options={{ title: ROUTINE_MESSAGES.newRoutineScreenTitle }}
      />
      <RoutineEditor
        renderExercisePicker={renderExercisePicker}
        routine={null}
      />
    </>
  );
}
