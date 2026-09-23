import { Link, Stack, useTheme } from "expo-router";
import { Text, View } from "react-native";

import { Button } from "@/components/button";

export default function NotFound() {
  const { colors } = useTheme();
  return (
    <View>
      <Stack.Screen options={{ headerShown: true, title: "Not found" }} />
      <Text style={{ color: colors.text }}>
        This screen doesn&apos;t exist.
      </Text>
      <Link asChild href="/">
        <Button title="Go to home" />
      </Link>
    </View>
  );
}
