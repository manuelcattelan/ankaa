import { Link, Stack } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/button";
import { Text } from "@/components/text";
import { messages } from "@/utilities/messages";

export default function NotFoundScreen() {
  return (
    <View>
      <Stack.Screen
        options={{ headerShown: true, title: messages.notFound.title }}
      />
      <Text>{messages.notFound.body}</Text>
      <Link asChild href="/">
        <Button title={messages.notFound.goHome} />
      </Link>
    </View>
  );
}
