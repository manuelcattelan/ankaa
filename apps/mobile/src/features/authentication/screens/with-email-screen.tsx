import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";

import { emailFormSchema } from "#/features/authentication/core/email-form-schema.ts";
import { getAuthenticationErrorMessage } from "#/features/authentication/core/get-authentication-error-message.ts";
import { AUTHENTICATION_MESSAGES } from "#/features/authentication/messages/authentication-messages.ts";
import { otpCodeRequestMutationOptions } from "#/features/authentication/mutations/otp-code-request-mutation-options.ts";
import { Button } from "#/shared/components/button.tsx";
import { ScrollView } from "#/shared/components/scroll-view.tsx";
import { TextField } from "#/shared/components/text-field.tsx";
import { decodeForm } from "#/shared/core/decode-form.ts";
import { useAnnounceMessage } from "#/shared/hooks/use-announce-message.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";

export function WithEmailScreen() {
  const router = useRouter();

  const runtime = useRuntime();

  const announceMessage = useAnnounceMessage();

  const [email, setEmail] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const sendOtpCode = useMutation({
    ...otpCodeRequestMutationOptions(runtime),
    onError: (error) => {
      announceMessage(getAuthenticationErrorMessage(error));
    },
  });

  const emailFormDecoding = decodeForm({
    hasSubmitted,
    schema: emailFormSchema,
    values: { email },
  });

  const emailErrorMessage =
    sendOtpCode.error === null
      ? emailFormDecoding.errorMessages.email
      : getAuthenticationErrorMessage(sendOtpCode.error);

  function handleSendOtpCode() {
    // The keyboard's submit key also sends the code, and a TextInput has no
    // disabled state that holds it back while a request is in flight.
    if (sendOtpCode.isPending) {
      return;
    }

    setHasSubmitted(true);
    sendOtpCode.reset();

    const submittedEmailFormDecoding = decodeForm({
      hasSubmitted: true,
      schema: emailFormSchema,
      values: { email },
    });

    if (submittedEmailFormDecoding.value === null) {
      if (submittedEmailFormDecoding.errorMessages.email !== null) {
        announceMessage(submittedEmailFormDecoding.errorMessages.email);
      }

      return;
    }

    const decodedEmail = submittedEmailFormDecoding.value.email;

    sendOtpCode.mutate(
      { email: decodedEmail },
      {
        onSuccess: () => {
          router.push({
            params: { email: decodedEmail },
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
        disabled={sendOtpCode.isPending}
        isBusy={sendOtpCode.isPending}
        onPress={handleSendOtpCode}
        title={AUTHENTICATION_MESSAGES.sendOtpCodeButton}
      />
    </ScrollView>
  );
}
