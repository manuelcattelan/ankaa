import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="sign-in/index" options={{ title: "Sign in" }} />
      <Stack.Screen
        name="sign-in/with-email/index"
        options={{ title: "Continue with email" }}
      />
      <Stack.Screen
        name="sign-in/with-email/verify-otp"
        options={{ title: "Enter OTP code" }}
      />
    </Stack>
  );
}
