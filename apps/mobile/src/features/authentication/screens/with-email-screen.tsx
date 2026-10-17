import { useMutation } from "@tanstack/react-query";
import * as Match from "effect/Match";
import { useRouter } from "expo-router";
import { useState } from "react";

import { getAuthenticationErrorMessage } from "@/features/authentication/core/get-authentication-error-message";
import { getEmailValidationErrorMessage } from "@/features/authentication/core/get-email-validation-error-message";
import { validateEmail } from "@/features/authentication/core/validate-email";
import { announceAuthenticationError } from "@/features/authentication/interactors/announce-authentication-error";
import { withEmailScreenMessages } from "@/features/authentication/messages/with-email-screen-messages";
import { createOtpCodeRequestMutationOptions } from "@/features/authentication/mutations/create-otp-code-request-mutation-options";
import { Button } from "@/shared/components/button";
import { ScrollView } from "@/shared/components/scroll-view";
import { TextField } from "@/shared/components/text-field";
import { useRuntime } from "@/shared/hooks/use-runtime";
import { announceMessage } from "@/shared/interactors/announce-message";

export function WithEmailScreen() {
  const router = useRouter();

  const runtime = useRuntime();

  const [email, setEmail] = useState("");
  const [emailValidationError, setEmailValidationError] = useState<string>();

  const sendOtpCode = useMutation({
    ...createOtpCodeRequestMutationOptions(runtime),
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

    const trimmedEmail = email.trim();
    const emailValidationOutcome = validateEmail(trimmedEmail);
    const emailValidationErrorMessage = getEmailValidationErrorMessage(
      emailValidationOutcome,
    );

    Match.valueTags(emailValidationOutcome, {
      EmailInvalid: () => {
        setEmailValidationError(emailValidationErrorMessage);

        if (emailValidationErrorMessage) {
          runtime.runSync(announceMessage(emailValidationErrorMessage));
        }
      },
      EmailValid: () => {
        sendOtpCode.mutate(
          { email: trimmedEmail },
          {
            onSuccess: () => {
              router.push({
                params: { email: trimmedEmail },
                pathname: "/sign-in/with-email/validate-otp-code",
              });
            },
          },
        );
      },
    });
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
        label={withEmailScreenMessages.emailLabel}
        onChangeText={setEmail}
        onSubmitEditing={handleSendOtpCode}
        value={email}
      />
      <Button
        isBusy={sendOtpCode.isPending}
        onPress={handleSendOtpCode}
        title={withEmailScreenMessages.sendOtpCodeButton}
      />
    </ScrollView>
  );
}
