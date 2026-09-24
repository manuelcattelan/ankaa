import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/button";
import { ScrollView } from "@/components/scroll-view";
import { TextField } from "@/components/text-field";
import { announceMessage } from "@/utilities/accessibility";
import { requestOtpCode } from "@/utilities/authentication";
import {
  announceAuthenticationError,
  getAuthenticationErrorMessage,
} from "@/utilities/errors";
import { messages } from "@/utilities/messages";

export default function WithEmailScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [emailValidationError, setEmailValidationError] = useState<string>();

  const sendOtpCode = useMutation({
    mutationFn: requestOtpCode,
    onError: announceAuthenticationError,
  });

  const emailErrorMessage = sendOtpCode.error
    ? getAuthenticationErrorMessage(sendOtpCode.error)
    : emailValidationError;

  function handleSendOtpCode() {
    if (sendOtpCode.isPending) {
      return;
    }

    setEmailValidationError(undefined);
    sendOtpCode.reset();

    const parsedEmail = z.email().safeParse(email.trim());

    if (!parsedEmail.success) {
      setEmailValidationError(messages.error.invalidEmail);
      announceMessage(messages.error.invalidEmail);

      return;
    }

    sendOtpCode.mutate(
      { email: parsedEmail.data },
      {
        onSuccess: () => {
          router.push({
            params: { email: parsedEmail.data },
            pathname: "/sign-in/with-email/verify-otp-code",
          });
        },
      },
    );
  }

  return (
    <ScrollView>
      <TextField
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        autoFocus
        enterKeyHint="send"
        errorMessage={emailErrorMessage}
        inputMode="email"
        label={messages.withEmail.emailLabel}
        onChangeText={setEmail}
        onSubmitEditing={handleSendOtpCode}
        value={email}
      />
      <Button
        isBusy={sendOtpCode.isPending}
        onPress={handleSendOtpCode}
        title={messages.withEmail.continue}
      />
    </ScrollView>
  );
}
