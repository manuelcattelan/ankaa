import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/button";
import { KeyboardAvoidingView } from "@/components/keyboard-avoiding-view";
import { ScrollView } from "@/components/scroll-view";
import { StatusMessage } from "@/components/status-message";
import { Text } from "@/components/text";
import { TextInput } from "@/components/text-input";
import { announceMessage } from "@/utilities/accessibility";
import { sendVerificationCode } from "@/utilities/authentication";
import {
  announceAuthenticationError,
  getAuthenticationErrorMessage,
} from "@/utilities/errors";
import { messages } from "@/utilities/messages";

export default function WithEmailScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState<string>();

  const sendCode = useMutation({
    mutationFn: sendVerificationCode,
    onError: announceAuthenticationError,
  });

  const errorMessage = sendCode.error
    ? getAuthenticationErrorMessage(sendCode.error)
    : validationError;

  function handleSendCode() {
    if (sendCode.isPending) {
      return;
    }

    setValidationError(undefined);
    sendCode.reset();
    const parsedEmail = z.email().safeParse(email.trim());

    if (!parsedEmail.success) {
      setValidationError(messages.error.invalidEmail);
      announceMessage(messages.error.invalidEmail);

      return;
    }

    sendCode.mutate(
      { email: parsedEmail.data },
      {
        onSuccess: () => {
          router.push({
            params: { email: parsedEmail.data },
            pathname: "/sign-in/with-email/verify-otp",
          });
        },
      },
    );
  }

  return (
    <KeyboardAvoidingView>
      <ScrollView>
        <Text>{messages.withEmail.emailLabel}</Text>
        <TextInput
          accessibilityLabel={messages.withEmail.emailAccessibilityLabel(
            errorMessage,
          )}
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          autoFocus
          enterKeyHint="send"
          inputMode="email"
          onChangeText={setEmail}
          onSubmitEditing={handleSendCode}
          value={email}
        />
        <StatusMessage message={errorMessage} />
        <Button
          isBusy={sendCode.isPending}
          onPress={handleSendCode}
          title={messages.withEmail.continue}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
