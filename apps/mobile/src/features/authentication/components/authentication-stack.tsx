import { Stack } from "expo-router";

import { signInScreenMessages } from "@/features/authentication/messages/sign-in-screen-messages";
import { validateOtpCodeScreenMessages } from "@/features/authentication/messages/validate-otp-code-screen-messages";
import { withEmailScreenMessages } from "@/features/authentication/messages/with-email-screen-messages";

export function AuthenticationStack() {
  return (
    <Stack>
      <Stack.Screen
        name="sign-in/index"
        options={{ title: signInScreenMessages.title }}
      />
      <Stack.Screen
        name="sign-in/with-email/index"
        options={{ title: withEmailScreenMessages.title }}
      />
      <Stack.Screen
        name="sign-in/with-email/validate-otp-code"
        options={{ title: validateOtpCodeScreenMessages.title }}
      />
    </Stack>
  );
}
