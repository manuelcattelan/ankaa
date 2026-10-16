import { Link, Stack } from "expo-router";
import { View } from "react-native";

import { Button } from "@/shared/components/button";
import { Text } from "@/shared/components/text";
import { messages } from "@/utilities/messages";

export default function NotFoundRoute() {
  return (
    <View>
      <Stack.Screen
        options={{ headerShown: true, title: messages.notFound.title }}
      />
      <Text>{messages.notFound.body}</Text>
      <Link asChild href="/">
        <Button title={messages.notFound.goHomeButton} />
      </Link>
    </View>
  );
}
