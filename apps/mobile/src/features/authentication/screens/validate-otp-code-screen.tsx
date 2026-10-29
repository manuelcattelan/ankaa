import { useMutation } from "@tanstack/react-query";
import * as Match from "effect/Match";
import { Redirect } from "expo-router";
import { useState } from "react";
import { Platform } from "react-native";

import { OTP_CODE_LENGTH } from "#/features/authentication/constants/otp-code-length.ts";
import { getCooldownDeadline } from "#/features/authentication/core/get-cooldown-deadline.ts";
import { getOtpCodeCompletenessValidationErrorMessage } from "#/features/authentication/core/get-otp-code-completeness-validation-error-message.ts";
import { getOtpCodeErrorMessage } from "#/features/authentication/core/get-otp-code-error-message.ts";
import { isAuthenticationRateLimited } from "#/features/authentication/core/is-authentication-rate-limited.ts";
import { validateOtpCodeCompleteness } from "#/features/authentication/core/validate-otp-code-completeness.ts";
import { useCooldown } from "#/features/authentication/hooks/use-cooldown.ts";
import { announceAuthenticationError } from "#/features/authentication/interactors/announce-authentication-error.ts";
import { VALIDATE_OTP_CODE_SCREEN_MESSAGES } from "#/features/authentication/messages/validate-otp-code-screen-messages.ts";
import { otpCodeRequestMutationOptions } from "#/features/authentication/mutations/otp-code-request-mutation-options.ts";
import { otpCodeSignInMutationOptions } from "#/features/authentication/mutations/otp-code-sign-in-mutation-options.ts";
import { Button } from "#/shared/components/button.tsx";
import { ScrollView } from "#/shared/components/scroll-view.tsx";
import { TextField } from "#/shared/components/text-field.tsx";
import { Text } from "#/shared/components/text.tsx";
import { AuthenticationClientError } from "#/shared/errors/authentication-client-error.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { announceMessage } from "#/shared/interactors/announce-message.ts";

type ValidateOtpCodeContentProps = {
  email: string;
};

type ValidateOtpCodeScreenProps = {
  email?: string;
};

const COOLDOWN_SECONDS = 60;

export function ValidateOtpCodeScreen({ email }: ValidateOtpCodeScreenProps) {
  if (!email) {
    return <Redirect href="/sign-in" />;
  }

  return <ValidateOtpCodeContent email={email} />;
}

function getResendCooldownInitialDeadline() {
  return getCooldownDeadline({
    seconds: COOLDOWN_SECONDS,
    start: Date.now(),
  });
}

function ValidateOtpCodeContent({ email }: ValidateOtpCodeContentProps) {
  const runtime = useRuntime();

  const [
    resendCooldownRemainingSeconds,
    startResendCooldown,
    stopResendCooldown,
  ] = useCooldown({
    endMessage:
      VALIDATE_OTP_CODE_SCREEN_MESSAGES.resendOtpCodeReadyAnnouncement,
    getInitialDeadline: getResendCooldownInitialDeadline,
  });
  const [validateCooldownRemainingSeconds, startValidateCooldown] = useCooldown(
    {
      endMessage:
        VALIDATE_OTP_CODE_SCREEN_MESSAGES.validateOtpCodeReadyAnnouncement,
    },
  );

  const [otpCode, setOtpCode] = useState("");
  const [otpCodeValidationError, setOtpCodeValidationError] =
    useState<string>();
  const [shouldRequestNewOtpCode, setShouldRequestNewOtpCode] = useState(false);

  const resendOtpCode = useMutation({
    ...otpCodeRequestMutationOptions(runtime),
    onError: (error) => {
      runtime.runSync(announceAuthenticationError(error));

      if (isAuthenticationRateLimited(error)) {
        startResendCooldown(error.retryAfterSeconds ?? COOLDOWN_SECONDS);
      }
    },
    onSuccess: () => {
      setOtpCode("");
      setShouldRequestNewOtpCode(false);
      startResendCooldown(COOLDOWN_SECONDS);
    },
  });

  const validateOtpCode = useMutation({
    ...otpCodeSignInMutationOptions(runtime),
    onError: (error) => {
      runtime.runSync(announceAuthenticationError(error));

      if (!(error instanceof AuthenticationClientError)) {
        return;
      }

      if (isAuthenticationRateLimited(error)) {
        startValidateCooldown(error.retryAfterSeconds ?? COOLDOWN_SECONDS);
      }

      if (error.code === "INVALID_OTP") {
        setOtpCode("");
      }

      if (error.code === "OTP_EXPIRED" || error.code === "TOO_MANY_ATTEMPTS") {
        setOtpCode("");
        setShouldRequestNewOtpCode(true);
        stopResendCooldown();
      }
    },
  });

  const canValidateOtpCode =
    !shouldRequestNewOtpCode && validateCooldownRemainingSeconds === 0;

  const resendOtpCodeErrorMessage = getOtpCodeErrorMessage({
    cooldownRemainingSeconds: resendCooldownRemainingSeconds,
    error: resendOtpCode.error,
  });
  const validateOtpCodeErrorMessage = getOtpCodeErrorMessage({
    cooldownRemainingSeconds: validateCooldownRemainingSeconds,
    error: validateOtpCode.error,
  });
  const otpCodeErrorMessage =
    validateOtpCodeErrorMessage ??
    resendOtpCodeErrorMessage ??
    otpCodeValidationError;

  function handleResendOtpCode() {
    if (resendOtpCode.isPending) {
      return;
    }

    setOtpCodeValidationError(undefined);
    resendOtpCode.reset();
    validateOtpCode.reset();

    resendOtpCode.mutate({ email });
  }

  function handleValidateOtpCode() {
    if (validateOtpCode.isPending || !canValidateOtpCode) {
      return;
    }

    setOtpCodeValidationError(undefined);
    validateOtpCode.reset();
    resendOtpCode.reset();

    const otpCodeCompletenessValidationOutcome =
      validateOtpCodeCompleteness(otpCode);
    const otpCodeCompletenessValidationErrorMessage =
      getOtpCodeCompletenessValidationErrorMessage(
        otpCodeCompletenessValidationOutcome,
      );

    Match.valueTags(otpCodeCompletenessValidationOutcome, {
      OtpCodeCompletenessValid: () => {
        validateOtpCode.mutate({ email, otpCode });
      },
      OtpCodeIncomplete: () => {
        setOtpCodeValidationError(otpCodeCompletenessValidationErrorMessage);

        if (otpCodeCompletenessValidationErrorMessage) {
          runtime.runSync(
            announceMessage(otpCodeCompletenessValidationErrorMessage),
          );
        }
      },
    });
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
        label={VALIDATE_OTP_CODE_SCREEN_MESSAGES.otpCodeLabel}
        maxLength={OTP_CODE_LENGTH}
        onChangeText={setOtpCode}
        onSubmitEditing={handleValidateOtpCode}
        value={otpCode}
      />
      <Button
        disabled={!canValidateOtpCode}
        isBusy={validateOtpCode.isPending}
        onPress={handleValidateOtpCode}
        title={VALIDATE_OTP_CODE_SCREEN_MESSAGES.validateOtpCodeButton}
      />
      <Button
        accessibilityHint={VALIDATE_OTP_CODE_SCREEN_MESSAGES.resendOtpCodeHint}
        disabled={resendCooldownRemainingSeconds > 0}
        isBusy={resendOtpCode.isPending}
        onPress={handleResendOtpCode}
        title={VALIDATE_OTP_CODE_SCREEN_MESSAGES.resendOtpCodeButton}
      />
      {resendCooldownRemainingSeconds > 0 ? (
        <Text>
          {VALIDATE_OTP_CODE_SCREEN_MESSAGES.resendOtpCodeCooldownStatus(
            resendCooldownRemainingSeconds,
          )}
        </Text>
      ) : null}
    </ScrollView>
  );
}
