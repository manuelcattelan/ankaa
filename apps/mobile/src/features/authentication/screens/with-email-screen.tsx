import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";

import { emailFormSchema } from "#/features/authentication/core/email-form-schema.ts";
import { getAuthenticationErrorMessage } from "#/features/authentication/core/get-authentication-error-message.ts";
import { announceAuthenticationError } from "#/features/authentication/interactors/announce-authentication-error.ts";
import { AUTHENTICATION_MESSAGES } from "#/features/authentication/messages/authentication-messages.ts";
import { otpCodeRequestMutationOptions } from "#/features/authentication/mutations/otp-code-request-mutation-options.ts";
import { Button } from "#/shared/components/button.tsx";
import { ScrollView } from "#/shared/components/scroll-view.tsx";
import { TextField } from "#/shared/components/text-field.tsx";
import { decodeForm } from "#/shared/core/decode-form.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { announceMessage } from "#/shared/interactors/announce-message.ts";

export function WithEmailScreen() {
  const router = useRouter();

  const runtime = useRuntime();

  const [email, setEmail] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const sendOtpCode = useMutation({
    ...otpCodeRequestMutationOptions(runtime),
    onError: (error) => {
      runtime.runSync(announceAuthenticationError(error));
    },
  });

  const trimmedEmail = email.trim();
  const emailFormDecoding = decodeForm({
    schema: emailFormSchema,
    values: { email: trimmedEmail },
  });

  const emailValidationErrorMessage = hasSubmitted
    ? emailFormDecoding.errorMessages.email
    : null;
  const emailErrorMessage =
    sendOtpCode.error === null
      ? emailValidationErrorMessage
      : getAuthenticationErrorMessage(sendOtpCode.error);

  function handleSendOtpCode() {
    if (sendOtpCode.isPending) {
      return;
    }

    setHasSubmitted(true);
    sendOtpCode.reset();

    if (!emailFormDecoding.isValid) {
      if (emailFormDecoding.errorMessages.email !== null) {
        runtime.runSync(announceMessage(emailFormDecoding.errorMessages.email));
      }

      return;
    }

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
        label={AUTHENTICATION_MESSAGES.emailLabel}
        onChangeText={setEmail}
        onSubmitEditing={handleSendOtpCode}
        value={email}
      />
      <Button
        isBusy={sendOtpCode.isPending}
        onPress={handleSendOtpCode}
        title={AUTHENTICATION_MESSAGES.sendOtpCodeButton}
      />
    </ScrollView>
  );
}
