import type { ReactNode } from "react";

import { Stack } from "expo-router";

import { ScrollView } from "#/shared/components/scroll-view.tsx";
import { homeScreenMessages } from "#/shared/messages/home-screen-messages.ts";

type HomeScreenProperties = {
  children: ReactNode;
};

export function HomeScreen({ children }: HomeScreenProperties) {
  return (
    <>
      <Stack.Screen options={{ title: homeScreenMessages.title }} />
      <ScrollView>{children}</ScrollView>
    </>
  );
}
