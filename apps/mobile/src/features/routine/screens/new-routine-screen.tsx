import type { ComponentProps } from "react";

import { Stack } from "expo-router";

import { RoutineEditor } from "@/features/routine/components/routine-editor";
import { newRoutineScreenMessages } from "@/features/routine/messages/new-routine-screen-messages";

type NewRoutineScreenProperties = Pick<
  ComponentProps<typeof RoutineEditor>,
  "renderExercisePicker"
>;

export function NewRoutineScreen({
  renderExercisePicker,
}: NewRoutineScreenProperties) {
  return (
    <>
      <Stack.Screen options={{ title: newRoutineScreenMessages.title }} />
      <RoutineEditor renderExercisePicker={renderExercisePicker} />
    </>
  );
}
