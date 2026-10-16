import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { z } from "zod";

import { Button } from "@/shared/components/button";
import { ScrollView } from "@/shared/components/scroll-view";
import { TextField } from "@/shared/components/text-field";
import { useAccessibility } from "@/shared/hooks/use-accessibility";
import { useAuthenticationClient } from "@/shared/hooks/use-authentication-client";
import { useRuntime } from "@/shared/hooks/use-runtime";
import { requestOtpCode } from "@/utilities/authentication";
import {
  announceAuthenticationError,
  getAuthenticationErrorMessage,
} from "@/utilities/errors";
import { messages } from "@/utilities/messages";

type SendOtpCodeVariables = {
  email: string;
};

export default function WithEmailRoute() {
  const router = useRouter();

  const authenticationClient = useAuthenticationClient();

  const runtime = useRuntime();

  const accessibility = useAccessibility();

  const [email, setEmail] = useState("");
  const [emailValidationError, setEmailValidationError] = useState<string>();

  const sendOtpCode = useMutation({
    mutationFn: (sendOtpCodeVariables: SendOtpCodeVariables) =>
      requestOtpCode({ ...sendOtpCodeVariables, authenticationClient }),
    onError: (error) => {
      runtime.runSync(announceAuthenticationError(error));
    },
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
      setEmailValidationError(messages.error.emailInvalid);

      runtime.runSync(
        accessibility.announceMessage(messages.error.emailInvalid),
      );

      return;
    }

    sendOtpCode.mutate(
      { email: parsedEmail.data },
      {
        onSuccess: () => {
          router.push({
            params: { email: parsedEmail.data },
            pathname: "/sign-in/with-email/validate-otp-code",
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
        title={messages.withEmail.sendOtpCodeButton}
      />
    </ScrollView>
  );
}
