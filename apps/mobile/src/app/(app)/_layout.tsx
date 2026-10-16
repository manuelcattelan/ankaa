import { Stack } from "expo-router";

import { messages } from "@/utilities/messages";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: messages.app.title }} />
      <Stack.Screen
        name="workout"
        options={{ title: messages.workout.title }}
      />
    </Stack>
  );
}
