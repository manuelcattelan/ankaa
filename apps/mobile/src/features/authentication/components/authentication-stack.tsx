import { Stack } from "expo-router";

import { SIGN_IN_SCREEN_MESSAGES } from "#/features/authentication/messages/sign-in-screen-messages.ts";
import { VALIDATE_OTP_CODE_SCREEN_MESSAGES } from "#/features/authentication/messages/validate-otp-code-screen-messages.ts";
import { WITH_EMAIL_SCREEN_MESSAGES } from "#/features/authentication/messages/with-email-screen-messages.ts";

export function AuthenticationStack() {
  return (
    <Stack>
      <Stack.Screen
        name="sign-in/index"
        options={{ title: SIGN_IN_SCREEN_MESSAGES.title }}
      />
      <Stack.Screen
        name="sign-in/with-email/index"
        options={{ title: WITH_EMAIL_SCREEN_MESSAGES.title }}
      />
      <Stack.Screen
        name="sign-in/with-email/validate-otp-code"
        options={{ title: VALIDATE_OTP_CODE_SCREEN_MESSAGES.title }}
      />
    </Stack>
  );
}
