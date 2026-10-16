import type { ReactNode } from "react";

import { Stack } from "expo-router";

import { ScrollView } from "@/shared/components/scroll-view";
import { homeScreenMessages } from "@/shared/messages/home-screen-messages";

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
