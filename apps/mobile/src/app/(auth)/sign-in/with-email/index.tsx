import { useMutation } from "@tanstack/react-query";
import { useRouter, useTheme } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { z } from "zod";

import { Button } from "@/components/button";
import { authClient } from "@/lib/auth";
import {
  announce,
  getAuthErrorMessage,
  INVALID_EMAIL_MESSAGE,
  unwrap,
} from "@/utils/errors";

export default function SignInWithEmail() {
  const { colors } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState<null | string>(null);
  const sendCode = useMutation({
    mutationFn: async (variables: { email: string }) => {
      let retryAfterSeconds: number | undefined;
      const response = await authClient.emailOtp.sendVerificationOtp(
        { email: variables.email, type: "sign-in" },
        {
          onError: (context) => {
            const header = context.response.headers.get("X-Retry-After");
            if (header) {
              retryAfterSeconds = Number(header);
            }
          },
        },
      );
      return unwrap(response, { retryAfterSeconds });
    },
    onError: (error) => {
      announce(getAuthErrorMessage(error));
    },
  });
  const errorMessage = sendCode.error
    ? getAuthErrorMessage(sendCode.error)
    : validationError;
  function handleSubmit() {
    if (sendCode.isPending) {
      return;
    }
    setValidationError(null);
    sendCode.reset();
    const parsed = z.email().safeParse(email.trim());
    if (!parsed.success) {
      setValidationError(INVALID_EMAIL_MESSAGE);
      announce(INVALID_EMAIL_MESSAGE);
      return;
    }
    sendCode.mutate(
      { email: parsed.data },
      {
        onSuccess: () => {
          router.push({
            params: { email: parsed.data },
            pathname: "/sign-in/with-email/verify-otp",
          });
        },
      },
    );
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "android" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ color: colors.text }}>Email</Text>
        <TextInput
          accessibilityLabel={
            errorMessage ? `Email, error: ${errorMessage}` : "Email"
          }
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          autoFocus
          enterKeyHint="send"
          inputMode="email"
          onChangeText={setEmail}
          onSubmitEditing={handleSubmit}
          style={{
            borderColor: colors.border,
            borderWidth: StyleSheet.hairlineWidth,
            color: colors.text,
            minHeight: 48,
          }}
          value={email}
        />
        <View accessible aria-live="polite">
          <Text selectable style={{ color: colors.text }}>
            {errorMessage ?? ""}
          </Text>
        </View>
        <Button
          busy={sendCode.isPending}
          onPress={handleSubmit}
          title="Continue"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
