import { Stack } from "expo-router";

import { messages } from "@/utilities/messages";

export default function AuthenticationLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="sign-in/index"
        options={{ title: messages.signIn.title }}
      />
      <Stack.Screen
        name="sign-in/with-email/index"
        options={{ title: messages.withEmail.title }}
      />
      <Stack.Screen
        name="sign-in/with-email/verify-otp"
        options={{ title: messages.verifyOtp.title }}
      />
    </Stack>
  );
}
