import type { ReactNode } from "react";

import { Stack } from "expo-router";

import { ScrollView } from "#/shared/components/scroll-view.tsx";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

export function HomeScreen({ children }: { children: ReactNode }) {
  return (
    <>
      <Stack.Screen options={{ title: SHARED_MESSAGES.homeScreenTitle }} />
      <ScrollView>{children}</ScrollView>
    </>
  );
}
