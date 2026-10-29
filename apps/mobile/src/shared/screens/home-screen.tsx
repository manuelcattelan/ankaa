import type { ReactNode } from "react";

import { Stack } from "expo-router";

import { ScrollView } from "#/shared/components/scroll-view.tsx";
import { HOME_SCREEN_MESSAGES } from "#/shared/messages/home-screen-messages.ts";

export function HomeScreen({ children }: { children: ReactNode }) {
  return (
    <>
      <Stack.Screen options={{ title: HOME_SCREEN_MESSAGES.title }} />
      <ScrollView>{children}</ScrollView>
    </>
  );
}
