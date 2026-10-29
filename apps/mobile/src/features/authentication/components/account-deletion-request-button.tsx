import { useMutation } from "@tanstack/react-query";

import { getAuthenticationErrorMessage } from "#/features/authentication/core/get-authentication-error-message.ts";
import { AUTHENTICATION_MESSAGES } from "#/features/authentication/messages/authentication-messages.ts";
import { accountDeletionRequestMutationOptions } from "#/features/authentication/mutations/account-deletion-request-mutation-options.ts";
import { Button } from "#/shared/components/button.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";

export function AccountDeletionRequestButton() {
  const runtime = useRuntime();

  const requestAccountDeletion = useMutation(
    accountDeletionRequestMutationOptions(runtime),
  );

  const accountDeletionRequestMessage = requestAccountDeletion.isSuccess
    ? AUTHENTICATION_MESSAGES.accountDeletionRequestedStatus
    : null;

  function handleRequestAccountDeletion() {
    requestAccountDeletion.mutate();
  }

  return (
    <>
      <Button
        disabled={requestAccountDeletion.isPending}
        isBusy={requestAccountDeletion.isPending}
        onPress={handleRequestAccountDeletion}
        title={AUTHENTICATION_MESSAGES.deleteAccountButton}
      />
      <StatusMessage
        message={
          requestAccountDeletion.error === null
            ? accountDeletionRequestMessage
            : getAuthenticationErrorMessage(requestAccountDeletion.error)
        }
      />
    </>
  );
}
