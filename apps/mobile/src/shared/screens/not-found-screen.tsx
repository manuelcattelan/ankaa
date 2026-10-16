import { Link, Stack } from "expo-router";
import { View } from "react-native";

import { Button } from "@/shared/components/button";
import { Text } from "@/shared/components/text";
import { notFoundScreenMessages } from "@/shared/messages/not-found-screen-messages";

export function NotFoundScreen() {
  return (
    <View>
      <Stack.Screen
        options={{ headerShown: true, title: notFoundScreenMessages.title }}
      />
      <Text>{notFoundScreenMessages.body}</Text>
      <Link asChild href="/">
        <Button title={notFoundScreenMessages.goHomeButton} />
      </Link>
    </View>
  );
}
