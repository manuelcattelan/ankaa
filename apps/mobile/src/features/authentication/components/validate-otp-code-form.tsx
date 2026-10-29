import { OTP_CODE_LENGTH } from "@ankaa/core/features/authentication/constants/otp-code-length";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Platform } from "react-native";

import { getAuthenticationErrorMessage } from "#/features/authentication/core/get-authentication-error-message.ts";
import { isOtpCodeRejection } from "#/features/authentication/core/is-otp-code-rejection.ts";
import { otpCodeFormSchema } from "#/features/authentication/core/otp-code-form-schema.ts";
import { AUTHENTICATION_MESSAGES } from "#/features/authentication/messages/authentication-messages.ts";
import { otpCodeRequestMutationOptions } from "#/features/authentication/mutations/otp-code-request-mutation-options.ts";
import { otpCodeSignInMutationOptions } from "#/features/authentication/mutations/otp-code-sign-in-mutation-options.ts";
import { Button } from "#/shared/components/button.tsx";
import { ScrollView } from "#/shared/components/scroll-view.tsx";
import { TextField } from "#/shared/components/text-field.tsx";
import { decodeForm } from "#/shared/core/decode-form.ts";
import { useAnnounceMessage } from "#/shared/hooks/use-announce-message.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";

export function ValidateOtpCodeForm({ email }: { email: string }) {
  const runtime = useRuntime();

  const announceMessage = useAnnounceMessage();

  const [otpCode, setOtpCode] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const resendOtpCode = useMutation({
    ...otpCodeRequestMutationOptions(runtime),
    onError: (error) => {
      announceMessage(getAuthenticationErrorMessage(error));
    },
    onSuccess: () => {
      setOtpCode("");
    },
  });

  const validateOtpCode = useMutation({
    ...otpCodeSignInMutationOptions(runtime),
    onError: (error) => {
      announceMessage(getAuthenticationErrorMessage(error));

      if (isOtpCodeRejection(error)) {
        setOtpCode("");
      }
    },
  });

  const otpCodeFormDecoding = decodeForm({
    schema: otpCodeFormSchema,
    values: { otpCode },
  });
  const otpCodeValidationErrorMessage = hasSubmitted
    ? otpCodeFormDecoding.errorMessages.otpCode
    : null;
  const authenticationError = validateOtpCode.error ?? resendOtpCode.error;
  const otpCodeErrorMessage =
    authenticationError === null
      ? otpCodeValidationErrorMessage
      : getAuthenticationErrorMessage(authenticationError);

  function handleResendOtpCode() {
    if (resendOtpCode.isPending) {
      return;
    }

    setHasSubmitted(false);
    resendOtpCode.reset();
    validateOtpCode.reset();

    resendOtpCode.mutate({ email });
  }

  function handleValidateOtpCode() {
    if (validateOtpCode.isPending) {
      return;
    }

    setHasSubmitted(true);
    validateOtpCode.reset();
    resendOtpCode.reset();

    if (!otpCodeFormDecoding.isValid) {
      if (otpCodeFormDecoding.errorMessages.otpCode !== null) {
        announceMessage(otpCodeFormDecoding.errorMessages.otpCode);
      }

      return;
    }

    validateOtpCode.mutate({ email, otpCode });
  }

  return (
    <ScrollView>
      <TextField
        autoComplete={Platform.select({
          android: "email-otp",
          default: "one-time-code",
        })}
        autoCorrect={false}
        autoFocus
        enterKeyHint="done"
        errorMessage={otpCodeErrorMessage}
        inputMode="numeric"
        label={AUTHENTICATION_MESSAGES.otpCodeLabel}
        maxLength={OTP_CODE_LENGTH}
        onChangeText={setOtpCode}
        onSubmitEditing={handleValidateOtpCode}
        value={otpCode}
      />
      <Button
        isBusy={validateOtpCode.isPending}
        onPress={handleValidateOtpCode}
        title={AUTHENTICATION_MESSAGES.validateOtpCodeButton}
      />
      <Button
        accessibilityHint={AUTHENTICATION_MESSAGES.resendOtpCodeHint}
        disabled={resendOtpCode.isPending}
        isBusy={resendOtpCode.isPending}
        onPress={handleResendOtpCode}
        title={AUTHENTICATION_MESSAGES.resendOtpCodeButton}
      />
    </ScrollView>
  );
}
