import { Stack } from "expo-router";

import { AUTHENTICATION_MESSAGES } from "#/features/authentication/messages/authentication-messages.ts";

export function AuthenticationStack() {
  return (
    <Stack>
      <Stack.Screen
        name="sign-in/index"
        options={{ title: AUTHENTICATION_MESSAGES.signInScreenTitle }}
      />
      <Stack.Screen
        name="sign-in/with-email/index"
        options={{ title: AUTHENTICATION_MESSAGES.withEmailScreenTitle }}
      />
      <Stack.Screen
        name="sign-in/with-email/validate-otp-code"
        options={{ title: AUTHENTICATION_MESSAGES.validateOtpCodeScreenTitle }}
      />
    </Stack>
  );
}
